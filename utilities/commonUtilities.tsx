import { FireworksEmbeddings } from "@langchain/community/embeddings/fireworks";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import * as cheerio from "cheerio";
import { DocumentInterface } from "@langchain/core/documents";
import { clear } from "console";

// Utility function to retry a function for a given number of times
export async function retryFunction(fn: any, retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      // Attempt to execute the function
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt >= retries) {
        console.error(error);
        throw new Error(
          `Failed to execute function after ${retries} attempt(s)!`
        );
      }
    }
  }
}

// Utility function for fetching search results for a given topic from Serper API
export async function searchForSources(topic: string): Promise<string> {
  const serperApiKey = process.env.SERPER_API_KEY;
  let requestHeaders = new Headers();

  requestHeaders.append("X-API-KEY", serperApiKey || "");
  requestHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    q: topic,
  });

  let requestOptions: RequestInit = {
    method: "POST",
    headers: requestHeaders,
    body: raw,
    redirect: "follow",
  };

  console.log("Using serper API to get search results for topic: ", topic);

  const searchResults = await fetch(
    `https://google.serper.dev/search`,
    requestOptions
  );

  if (!searchResults.ok) {
    throw new Error("Error fetching search results from Serper API");
  }

  return await searchResults.text();
}

// Utility function for normalizing search results
export async function normalizeData(
  searchResults: string
): Promise<{ title: string; description: string; link: string }[]> {
  const parsedSearchResults = JSON.parse(searchResults);
  const extractedTitleDescAndLinks =
    extractTitleDescAndLinks(parsedSearchResults);

  const limit = Number(process.env.LIMIT_FOR_SEARCH_RESULTS ?? 5);
  return extractedTitleDescAndLinks.slice(0, limit);
}

// Utility function to extract title, description and links from search results
function extractTitleDescAndLinks(obj: {
  [x: string]: any;
}): { title: string; description: string; link: string }[] {
  const result: { title: string; description: string; link: string }[] = [];

  obj.organic.map((searchResult: { [x: string]: any }) => {
    if (
      searchResult.title &&
      searchResult.link &&
      !searchResult.link.includes("youtube") // Skipping youtube links for now as they won't contain any useful content on just scraping.
    ) {
      result.push({
        title: searchResult.title,
        description: searchResult.snippet ?? "No description available 😭",
        link: searchResult.link,
      });
    }
  });

  return result;
}

// Utility function to vectorize the content and store in memory vector database
export async function fetchHtmlContentAndVectorize(
  searchQuery: string,
  item: { title: string; description: string; link: string }
): Promise<null | DocumentInterface[]> {
  const embeddings = new FireworksEmbeddings();
  const htmlContent = await fetchPageContentFromLink(item.link);

  if (!htmlContent || htmlContent.length < 150) return null; // Return null if no content is fetched or content is too short

  const splitText = await new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 100,
  }).splitText(htmlContent);

  const vectorStore = await MemoryVectorStore.fromTexts(
    splitText,
    { link: item.link, title: item.title },
    embeddings
  );

  return await vectorStore.similaritySearch(searchQuery, 5);
}

// Helper function to fetch page content from a given link
async function fetchPageContentFromLink(link: string): Promise<string | null> {
  try {
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)", // Facebook user agent
    ];

    for (let i = 0; i < userAgents.length; i++) {
      console.log(
        `Fetching page content for ${link} using user agent: ${userAgents[i]}`
      );

      const responseText = await fetchDataFromUrl(link, userAgents[i]);

      if (responseText && responseText.length > 0) {
        return extractMainContent(responseText);
      }
    }

    return null; // Return null if no content is fetched
  } catch (error) {
    console.error(`Error fetching page content for ${link}:`);
    return null;
  }
}

// Helper function to fetch data from a given URL
async function fetchDataFromUrl(
  url: string,
  userAgent: string
): Promise<string | null> {
  const headers: HeadersInit = {
    "User-agent": userAgent,
  };

  const controller = new AbortController();
  const reason = new DOMException('signal timed out', 'TimeoutError');
  const timeoutId = setTimeout(() => controller.abort(reason), 5000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      return null; // Return null if response is not ok
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error(
      `Error fetching data from URL: ${url} with user agent: ${userAgent} - ${error}`
    );

    return null; // Return null if error occurs
  }
}

// Helper function to extract main content from the HTML page using cheerio
function extractMainContent(html: string): string {
  const $ = html.length ? cheerio.load(html) : null;

  if (!$) return "";

  $("script, style, head, nav, footer, iframe, img").remove();

  return $("body").text().replace(/\s+/g, " ").trim();
}

// Utility function to normalize chunk data
export function normalizeChunks(
  chunksArray: (
    | {
        pageContent: string;
        metadata: Record<string, any>;
        id?: string | undefined;
      }[]
    | null
  )[]
): string {
  return chunksArray
    .map(
      (
        array?:
          | {
              metadata: Record<string, any>;
              id?: string | undefined;
              pageContent: string;
            }[]
          | null
      ) => {
        if (!array) return "";

        return array.reduce((acc, item) => {
          if (item.pageContent) {
            acc += item.pageContent;
          }
          return acc;
        }, "");
      }
    )
    .join(" | ");
}

// Utility function to separate sentences from a paragraph
export function separateSentences(paragraph: string): string[] {
  // Regular expression to match sentence endings
  const sentenceRegex = /[.!?]+(?=\s+|$)/g;

  // Split the paragraph into sentences
  const sentences = paragraph.split(sentenceRegex);

  // Trim whitespace and filter out empty sentences
  return sentences
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .map((sentence) => sentence + ".");
}

// Utility function to convert all keys of an object to lowercase
export function lowercaseKeys<T extends Record<string, any>>(
  obj: T
): { [K in Lowercase<string & keyof T>]: T[keyof T] } {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      (acc as any)[key.toLowerCase()] = value;
      return acc;
    },
    {} as { [K in Lowercase<string & keyof T>]: T[keyof T] }
  );
}

// Utility function to convert date to a pretty format in local timezone
export function convertToPrettyDateFormatInLocalTimezone(
  inputDate: Date
): string {
  const date = inputDate.getDate();
  const month = inputDate.getMonth() + 1;
  const year = inputDate.getFullYear();

  const hours =
    inputDate.getHours() > 12
      ? inputDate.getHours() - 12
      : inputDate.getHours() === 0
        ? 12
        : inputDate.getHours();

  const minutes =
    inputDate.getMinutes() < 10
      ? "0" + inputDate.getMinutes()
      : inputDate.getMinutes();
  const amOrPm = inputDate.getHours() >= 12 ? "PM" : "AM";

  let fullDate = `${date}/${month}/${year}`;

  let today = new Date();

  if (
    inputDate.toLocaleDateString() ===
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toLocaleDateString()
  ) {
    fullDate = "Today";
  }

  return `${fullDate} at ${hours}:${minutes} ${amOrPm}`;
}

// Utility function to create an embedding from a query
export async function createEmbeddingFromQuery(
  query: string
): Promise<number[]> {
  const embeddings = new FireworksEmbeddings();
  const embedding = await embeddings.embedQuery(query);

  return embedding;
}
