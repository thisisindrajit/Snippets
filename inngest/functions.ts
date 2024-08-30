import Groq from "groq-sdk";
import { inngest } from "./client";
import {
  fetchHtmlContentAndVectorize,
  normalizeChunks,
  normalizeData,
  searchForSources,
} from "@/utilities/commonUtilities";
import { NonRetriableError } from "inngest";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

// Functions exported from this file are exposed to Inngest
// See: @/app/api/inngest/route.ts

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Params: searchQuery (string), userId (string)
export const generateSnippet = inngest.createFunction(
  {
    id: "generate-snippet", // Each function should have a unique ID
    retries: 2, // Number of retries
    onFailure: async ({ event, error }) => {
      console.error(
        "Inngest function failed after exhausting all retries - ",
        error.message
      );

      await fetchMutation(api.user_notifications.createNotification, {
        notification: event.data.event.data.searchQuery,
        notification_creator: undefined,
        notification_receiver: (
          await fetchQuery(api.users.getUserFromExternalId, {
            externalId: event.data.event.data.userId!,
          })
        )?._id,
        notification_type: (
          await fetchQuery(
            api.list_notification_types.getNotificationTypeDetails,
            { notificationType: "error" }
          )
        )?._id, // fetching notification type for error
      });
    },
  },
  { event: "app/generate.snippet" }, // When an event by this name received, this function will run
  async ({ event, step }) => {
    const {
      searchQuery,
      userId,
    }: { searchQuery: string; userId?: string | null } = event.data;

    if (!searchQuery || !userId) {
      throw new NonRetriableError(
        "Missing search query or user ID in parameters!"
      );
    }

    // STEP 1: Get topic based on the search query
    const topic = await step.run("get-topic-using-llm", async () => {
      if (groq) {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Create a concise search query for the given input that can be used in a search engine API to retrieve general information about the input.
              The query should:
              1.Be no longer than 5-7 words.
              2.Include the most relevant keywords related to the topic.
              3.Include 'overview', 'introduction' or 'wiki' if applicable to focus on general information.
              4.Do not add any quotation marks or extra words.
              Return only the search query string, without any additional explanation or formatting. If you don't have any information about the input, just return NO INFORMATION.`,
            },
            { role: "user", content: searchQuery },
          ],
          model: "llama3-70b-8192",
        });

        const generatedTopic = chatCompletion.choices[0]?.message?.content;

        if (generatedTopic) {
          return { generatedByLlm: true, data: generatedTopic };
        }
      } else {
        console.error("Groq API key is missing");
      }

      return { generatedByLlm: false, data: searchQuery };
    });

    // If no information is found by topic generator, then create an entry in the notifications table
    if (topic.generatedByLlm && topic.data.toLowerCase() === "no information") {
      await fetchMutation(api.user_notifications.createNotification, {
        notification: searchQuery,
        notification_creator: undefined,
        notification_receiver: (
          await fetchQuery(api.users.getUserFromExternalId, {
            externalId: userId!,
          })
        )?._id,
        notification_type: (
          await fetchQuery(
            api.list_notification_types.getNotificationTypeDetails,
            { notificationType: "no information" }
          )
        )?._id, // fetching notification type for no information
      });

      return {
        event,
        body: `No information found for the search query - ${searchQuery}`,
      };
    }

    // STEP 2: Use search API to get search results and retrieve similar chunks of text by vectorizing the normalized results
    const similarTextChunksAndReferences = await step.run(
      "search-and-retrieve-similar-snippets-by-vectorization",
      async () => {
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
          throw new Error("No similar chunks found!");
        }

        return {
          success: true,
          data: {
            similarTextChunks: allSimilarChunks,
            references: normalizedData,
          },
        };
      }
    );

    // STEP 3: Use topic and similar chunks to generate a snippet
    const snippet = await step.run("generate-snippet-using-rag", async () => {
      if (groq) {
        const normalizedChunks =
          !similarTextChunksAndReferences.data.similarTextChunks ||
          similarTextChunksAndReferences.data.similarTextChunks.length === 0
            ? ""
            : normalizeChunks(
                similarTextChunksAndReferences.data.similarTextChunks
              );

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Here is my topic - ${searchQuery}. Create a comprehensive summary of the given topic using the 5W1H framework (What/Who, Why, When, Where, How). For each category, provide an array of 3-4 complete, grammatically correct sentences. Use simple, concise language and include interesting facts. In each category:
              1.Ensure the information is accurate and relevant to the main topic, avoiding any speculative or unsupported details.
              2.Highlight 2-4 important words or phrases in each sentence using markdown bold format.
              3.Choose highlights that are key concepts, important terms, or significant details related to the category and main topic.
              4.Prioritize highlighting words that are separate words or phrases, rather than parts of a larger word or phrase.
              5.At least 1 sentence in each category must contain highlighted words.
              6.DO NOT HIGHLIGHT the main topic.
              Present the result as a JSON object with these keys: whatorwho, why, when, where, how, and amazingfacts. Include 3 amazing, unknown and interesting facts about the topic in the amazingfacts array if available. Focus on creating a broadly applicable summary, avoiding overly specific details from any provided context. The summary should be informative and relevant even without specific context. If you lack sufficient credible information about the topic, return only an EMPTY OBJECT.`,
            },
            {
              role: "user",
              content:
                normalizedChunks.length > 0
                  ? `Here are the top results for the given input from a similarity search. Use them if relevant information is available or else use information that is available to you. Some sentences might be incomplete and do not use them directly but rephrase as required - ${normalizedChunks}`
                  : "",
            },
          ],
          model: "llama3-70b-8192",
          response_format: { type: "json_object" },
        });

        const generatedSnippet = chatCompletion.choices[0]?.message?.content;

        if (generatedSnippet && generatedSnippet !== "{}") {
          const createdSnippetId = await fetchMutation(
            api.snippets.createSnippet,
            {
              title: searchQuery,
              likes_count: 0,
              generated_by_ai: true,
              requested_by: (
                await fetchQuery(api.users.getUserFromExternalId, {
                  externalId: userId!,
                })
              )?._id,
            }
          );

          await fetchMutation(
            api.snippet_type_and_data_mapping.addSnippetData,
            {
              snippet_id: createdSnippetId,
              type: (
                await fetchQuery(api.list_snippet_types.getSnippetTypeDetails, {
                  snippetType: "5w1h",
                })
              )?._id, // For now, only generating 5W1H type snippets
              data: JSON.parse(generatedSnippet),
              references:
                similarTextChunksAndReferences.data?.references ?? undefined,
            }
          );

          await fetchMutation(api.user_notifications.createNotification, {
            notification: `${searchQuery}|user/snippet/${createdSnippetId}`,
            notification_creator: undefined,
            notification_receiver: (
              await fetchQuery(api.users.getUserFromExternalId, {
                externalId: userId!,
              })
            )?._id,
            notification_type: (
              await fetchQuery(
                api.list_notification_types.getNotificationTypeDetails,
                { notificationType: "generated snippet" }
              )
            )?._id, // fetching notification type for generated snippet
          });

          return { success: true, data: JSON.parse(generatedSnippet) };
        }
      } else {
        console.error("Groq API key is missing");
      }

      throw new Error(
        `Could not able to generate snippet for the search query - ${searchQuery}`
      );
    });

    return { event, body: snippet };
  }
);
