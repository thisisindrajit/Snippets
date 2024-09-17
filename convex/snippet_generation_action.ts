import { v } from "convex/values";
import { action } from "./_generated/server";
import Groq from "groq-sdk";
import { api } from "./_generated/api";
import {
  createEmbeddingFromQuery,
  fetchHtmlContentAndVectorize,
  normalizeChunks,
  normalizeData,
  searchForSources,
} from "../utilities/commonUtilities";
import { TSnippet } from "../types/TSnippet";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateSnippet = action({
  args: { searchQuery: v.optional(v.string()), externalUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { searchQuery, externalUserId } = args;

    if (!searchQuery || !externalUserId) {
      console.error(
        "Invalid input. Please provide a search query and an external user Id."
      );
      return false;
    }

    if (!groq) {
      console.error("Groq not initialized. Check whether the API key is set.");
      return false;
    }

    // Get user details based on external user Id
    const userDetails = (
      await ctx.runQuery(api.users.getUserByExternalId, {
        externalId: externalUserId,
      })
    );

    // STEP 1: Get topic based on the search query
    const topicGenerationByLlm = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Create a concise search query for the given input that can be used in a search engine API to retrieve general information about the input.
              The query should:
              1.Be no longer than 5-7 words.
              2.Include the most relevant keywords related to the topic.
              3.Include 'overview' or 'introduction' if applicable to focus on general information.
              4.Do not add any quotation marks or extra words.
              Return only the search query string, without any additional explanation or formatting. If you don't have any information about the input, just return NO INFORMATION.`,
        },
        { role: "user", content: searchQuery },
      ],
      model: "llama3-70b-8192",
    });

    let topic = {
      generatedByLlm: false,
      data: searchQuery,
    };

    const generatedTopic = topicGenerationByLlm.choices[0]?.message?.content;

    if (generatedTopic) {
      topic = { generatedByLlm: true, data: generatedTopic };
    }

    // If no information is found by topic generator, then create an entry in the notifications table
    if (topic.generatedByLlm && topic.data.toLowerCase() === "no information") {
      await ctx.runMutation(api.notifications.createNotification, {
        notification: searchQuery,
        notification_creator: undefined,
        notification_receiver: userDetails?._id,
        notification_type: (
          await ctx.runQuery(
            api.list_notification_types.getNotificationTypeDetails,
            { notificationType: "no information" }
          )
        )?._id, // fetching notification type for no information
      });

      return false;
    }

    // STEP 2: Use search API to get search results and retrieve similar chunks of text by vectorizing the normalized results
    const formattedTopic = topic.data.replaceAll('"', ""); // Remove any quotation marks from the topic

    // Get search results
    const searchResults = await searchForSources(formattedTopic);

    // Normalize search results
    const normalizedData = await normalizeData(searchResults);

    // Vectorize the content and return all similar chunks
    const allSimilarChunks = await Promise.all(
      normalizedData.map(
        (item: { title: string; description: string; link: string }) =>
          fetchHtmlContentAndVectorize(searchQuery, item)
      )
    );

    if (!allSimilarChunks || allSimilarChunks.length === 0) {
      console.error("No similar chunks found!");

      await ctx.runMutation(api.notifications.createNotification, {
        notification: searchQuery,
        notification_creator: undefined,
        notification_receiver: userDetails?._id,
        notification_type: (
          await ctx.runQuery(
            api.list_notification_types.getNotificationTypeDetails,
            { notificationType: "error" }
          )
        )?._id, // fetching notification type for error
      });

      return false;
    }

    const similarTextChunksAndReferences = {
      similarTextChunks: allSimilarChunks,
      references: normalizedData,
    };

    // STEP 3: Use topic and similar chunks to generate a snippet
    const normalizedChunks =
      !similarTextChunksAndReferences.similarTextChunks ||
      similarTextChunksAndReferences.similarTextChunks.length === 0
        ? ""
        : normalizeChunks(similarTextChunksAndReferences.similarTextChunks);

    console.log("Normalized chunks: ", normalizedChunks);

    const snippetGenerationByLlm = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Here is my topic - ${searchQuery}. Create a comprehensive summary of the given topic using the 4W1H framework (What, Why, When, Where, How). For each category, provide an array of 2 complete, grammatically correct sentences using simple, concise language. In each category:
              1.Ensure the information is accurate and relevant to the main topic, avoiding any speculative or unsupported details.
              2.Make sure to highlight 2-4 important words or phrases in each sentence using markdown bold format.
              3.Choose highlights that are key concepts, important terms, or significant details related to the category and main topic.
              4.Prioritize highlighting words that are separate words or phrases, rather than parts of a larger word or phrase.
              5.Each sentence must contain a maximum of 50 words.
              Present the result as a JSON object only with these keys: what, why, when, where, how, amazingfacts, abstract, tags. Include 3 amazing, unknown and interesting facts about the topic in the amazingfacts array if available. Include a short abstract about the topic within 50 words in abstract. Include 5 general tags about the topic in the tags array. Do not include hashes and return just the tags. The tags must be in such a way that it describes the topic in a general manner. Focus on creating a broadly applicable summary, avoiding overly specific details from any provided context. The summary should be informative and relevant even without specific context. If you lack sufficient credible information about the topic, return only an EMPTY OBJECT.`,
        },
        {
          role: "user",
          content:
            normalizedChunks.length > 0
              ? `Here are the top results for the given input from a similarity search. Use them if relevant information is available. Do not use incomplete sentences and rephrase as required - ${normalizedChunks}`
              : "",
        },
      ],
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
    });

    const generatedSnippet =
      snippetGenerationByLlm.choices[0]?.message?.content;

    if (!generatedSnippet || generatedSnippet === "{}") {
      await ctx.runMutation(api.notifications.createNotification, {
        notification: searchQuery,
        notification_creator: undefined,
        notification_receiver: userDetails?._id,
        notification_type: (
          await ctx.runQuery(
            api.list_notification_types.getNotificationTypeDetails,
            { notificationType: "error" }
          )
        )?._id, // fetching notification type for error
      });

      return false;
    }

    // Get all required data from the generated snippet
    const data = JSON.parse(generatedSnippet) as TSnippet;
    const tags = data.tags;
    const abstract = data.abstract;

    // Create embedding of abstract
    const abstract_embedding = abstract ? await createEmbeddingFromQuery(abstract) : undefined;

    const createdSnippetId = await ctx.runMutation(api.snippets.createSnippet, {
      title: searchQuery,
      likes_count: 0,
      requested_by: userDetails?._id,
      requestor_name: userDetails?.firstName || "Snippets user",
      type: (
        await ctx.runQuery(api.list_snippet_types.getSnippetTypeDetails, {
          snippetType: "5w1h",
        })
      )?._id, // For now, only generating 5W1H type snippets
      data: data,
      tags: tags,
      references: similarTextChunksAndReferences?.references ?? undefined,
    });

    // Create embedding of snippet
    await ctx.runMutation(api.snippet_embeddings.createSnippet, {
      snippet_id: createdSnippetId,
      abstract: abstract,
      abstract_embedding: abstract_embedding,
    });

    await ctx.runMutation(api.notifications.createNotification, {
      notification: `${searchQuery}|snippet/${createdSnippetId}`,
      notification_creator: undefined,
      notification_receiver: userDetails?._id,
      notification_type: (
        await ctx.runQuery(
          api.list_notification_types.getNotificationTypeDetails,
          { notificationType: "generated snippet" }
        )
      )?._id, // fetching notification type for generated snippet
    });

    return true;
  },
});
