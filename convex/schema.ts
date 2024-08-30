import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.union(v.string(), v.null()),
    firstName: v.union(v.string(), v.null()),
    lastName: v.union(v.string(), v.null()),
    imageUrl: v.string(),
    primaryEmail: v.union(v.string(), v.null()),
    totalRewards: v.number(),
  }).index("byExternalId", ["externalId"]),
  user_notifications: defineTable({
    notification_creator: v.optional(v.id("users")),
    notification_receiver: v.optional(v.id("users")),
    notification_type: v.optional(v.id("list_notification_types")),
    notification: v.string(),
    is_read: v.boolean(),
    is_cleared: v.boolean(),
  }),
  rewards: defineTable({
    rewarded_user_id: v.id("users"),
    rewarded_xp: v.number(),
    rewarded_reason: v.id("list_reward_reasons"),
  }),
  snippets: defineTable({
    title: v.string(),
    likes_count: v.number(),
    generated_by_ai: v.boolean(),
    requested_by: v.optional(v.id("users")),
  }),
  snippet_type_and_data_mapping: defineTable({
    snippet_id: v.id("snippets"),
    type: v.optional(v.id("list_snippet_types")),
    data: v.any(), // Check if this can be changed to a more specific type
    references: v.optional(
      v.array(v.object({ link: v.string(), title: v.string(), description: v.string() }))
    ),
  }),
  snippet_likes: defineTable({
    snippet_id: v.id("snippets"),
    liked_by: v.id("users"),
  }),
  snippet_saves: defineTable({
    snippet_id: v.id("snippets"),
    saved_by: v.id("users"),
  }),
  snippet_notes: defineTable({
    snippet_id: v.id("snippets"),
    noted_by: v.id("users"),
    note: v.string(),
  }),
  list_notification_types: defineTable({
    notification_type: v.string(),
  }),
  list_snippet_types: defineTable({
    snippet_type: v.string(),
  }),
  list_reward_reasons: defineTable({
    reward_reason: v.string(),
  }),
});
