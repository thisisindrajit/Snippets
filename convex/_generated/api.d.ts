/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.12.0.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as abstract_embeddings from "../abstract_embeddings.js";
import type * as http from "../http.js";
import type * as likes from "../likes.js";
import type * as list_notification_types from "../list_notification_types.js";
import type * as list_snippet_types from "../list_snippet_types.js";
import type * as notes from "../notes.js";
import type * as notifications from "../notifications.js";
import type * as saves from "../saves.js";
import type * as similar_snippets_action from "../similar_snippets_action.js";
import type * as snippet_generation_action from "../snippet_generation_action.js";
import type * as snippets from "../snippets.js";
import type * as users from "../users.js";
import type * as welcome_email_internal_action from "../welcome_email_internal_action.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  abstract_embeddings: typeof abstract_embeddings;
  http: typeof http;
  likes: typeof likes;
  list_notification_types: typeof list_notification_types;
  list_snippet_types: typeof list_snippet_types;
  notes: typeof notes;
  notifications: typeof notifications;
  saves: typeof saves;
  similar_snippets_action: typeof similar_snippets_action;
  snippet_generation_action: typeof snippet_generation_action;
  snippets: typeof snippets;
  users: typeof users;
  welcome_email_internal_action: typeof welcome_email_internal_action;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
