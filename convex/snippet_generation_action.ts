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
import { TGeneratedSnippetData } from "../types/TGeneratedSnippetData";
import { Id } from "./_generated/dataModel";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateSnippet = action({
  args: {
    searchQuery: v.optional(v.string()),
    externalUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { searchQuery, externalUserId } = args;

    if (!searchQuery || !externalUserId) {
      console.error("searchQuery or externalUserId not provided!");
      return false;
    }

    if (!groq) {
      console.error("Groq not initialized. Check whether the API key is set!");
      return false;
    }

    // Get user details based on external user Id
    const user = await ctx.runQuery(api.users.getUserByExternalId, {
      externalId: externalUserId,
    });

    if (!user) {
      console.error(`User with externalUserId ${externalUserId} not found!`);
      return false;
    }

    // Start timer to get the time taken for the snippet generation
    const startTime = new Date().getTime();

    // STEP 1: Get topic based on the search query
    const topicGenerationByLlm = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            process.env.TOPIC_GENERATION_PROMPT ??
            `Create a concise search query for the given input that can be used in a search engine API to retrieve general information about the input.
              The query should:
              1.Be no longer than 5-7 words.
              2.Include the most relevant keywords related to the topic.
              3.Include the keyword 'introduction', 'wiki' or 'overview' if applicable to focus on general information.
              4.Do not add any quotation marks or extra words.
              Return only the search query string, without any additional explanation or formatting. If you don't have any information about the input, just return NO INFORMATION.`,
        },
        { role: "user", content: searchQuery },
      ],
      model: process.env.TOPIC_GENERATION_MODEL ?? "llama3-70b-8192",
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
        notification_receiver: user._id,
        type: "no information", // fetching notification type for no information
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
        notification_receiver: user._id,
        type: "error", // fetching notification type for error
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
          content: `Here is my topic - ${searchQuery}. ${
            process.env.SNIPPET_GENERATION_PROMPT ??
            `Create a comprehensive summary of the given topic using the 5W1H framework (What, Why, When, Where, How). For each category, provide an array of 2 complete, grammatically correct sentences. Use simple, concise language to accurately understand the content. Present the result as a JSON object only with these keys: what, why, when, where, how, amazingfacts, abstract, tags. In the keys 'what', 'why', 'when', 'where', 'how' and 'amazingfacts', follow these guidelines:
            1.Ensure the information is accurate and relevant to the main topic, avoiding any speculative or unsupported details.
            2.Make sure to highlight 2-4 important words or phrases in each sentence using markdown bold format.
            3.Choose highlights that are key concepts, important terms, or significant details related to the category and main topic.
            4.Prioritize highlighting words that are separate words or phrases, rather than parts of a larger word or phrase.
            5.Each sentence can contain a maximum of 50 words.
            6.Include 3 amazing, unknown and interesting facts about the topic in the amazingfacts array if available. 
            Also include a short abstract about the topic within 50 words in abstract. I want the abstract only in plain text format. Include 5 general tags about the topic in the tags array. Do not include hashes and return just the tags. The tags must be in such a way that it describes the topic in a general manner. Focus on creating a broadly applicable summary, avoiding overly specific details from any provided context. The summary should be informative and relevant even without specific context. If you lack sufficient credible information about the topic, return only an EMPTY OBJECT.`
          }`,
        },
        {
          role: "user",
          content:
            normalizedChunks.length > 0
              ? `Here are the top results for the given input from a similarity search. Use them if relevant information is available. Do not use incomplete sentences and rephrase as required - ${normalizedChunks}`
              : "",
        },
      ],
      model: process.env.SNIPPET_GENERATION_MODEL ?? "llama3-70b-8192",
      response_format: { type: "json_object" },
    });

    const generatedSnippet =
      snippetGenerationByLlm.choices[0]?.message?.content;

    if (!generatedSnippet || generatedSnippet === "{}") {
      await ctx.runMutation(api.notifications.createNotification, {
        notification: searchQuery,
        notification_creator: undefined,
        notification_receiver: user._id,
        type: "error", // fetching notification type for error
      });

      return false;
    }

    // Get all required data from the generated snippet
    const data = JSON.parse(generatedSnippet) as TGeneratedSnippetData;
    const tags = data.tags;
    const abstract = data.abstract;

    // Create embedding of abstract
    const abstract_embedding = abstract
      ? await createEmbeddingFromQuery(abstract)
      : undefined;

    let abstractEmbeddingId: Id<"abstract_embeddings"> | undefined = undefined;

    // Create embedding of abstract if available
    if (abstract_embedding) {
      abstractEmbeddingId = await ctx.runMutation(
        api.abstract_embeddings.createAbstractEmbedding,
        {
          embedding: abstract_embedding,
        }
      );
    }

    // End the time taken for the snippet generation
    const endTime = new Date().getTime();

    const createdSnippetId = await ctx.runMutation(api.snippets.createSnippet, {
      title: searchQuery,
      likes_count: 0,
      requested_by: user._id,
      requestor_name: user.firstName || "Snippets user",
      type: (
        await ctx.runQuery(api.list_snippet_types.getSnippetTypeDetails, {
          snippetType: "5w1h",
        })
      )?._id, // For now, only generating 5W1H type snippets
      model_used: `${process.env.SNIPPET_GENERATION_MODEL} | ${(endTime - startTime) / 1000} second(s)`, // Add the model used for snippet generation and time taken in seconds for generation
      topic_generated: topic.generatedByLlm ? topic.data : undefined,
      data: {
        what: data.what,
        why: data.why,
        when: data.when,
        where: data.where,
        how: data.how,
        amazingfacts: data.amazingfacts ?? [],
      },
      references: similarTextChunksAndReferences?.references,
      abstract: abstract,
      abstract_embedding_id: abstractEmbeddingId,
      tags: tags,
    });

    await ctx.runMutation(api.notifications.createNotification, {
      notification: `${searchQuery}|snippet/${createdSnippetId}`,
      notification_creator: undefined,
      notification_receiver: user._id,
      type: "generated snippet", // fetching notification type for generated snippet
    });

    return true;
  },
});
