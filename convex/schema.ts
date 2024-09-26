import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // this the Clerk Id, stored in the subject JWT field
    externalId: v.string(),
    firstName: v.union(v.string(), v.null()),
    lastName: v.union(v.string(), v.null()),
    imageUrl: v.string(),
    primaryEmail: v.string(),
    totalRewards: v.number(),
  }).index("byExternalId", ["externalId"]),
  notifications: defineTable({
    notification_creator: v.optional(v.id("users")),
    notification_receiver: v.id("users"),
    notification_type: v.optional(v.id("list_notification_types")),
    notification: v.string(),
  }).index("byNotificationReceiver", ["notification_receiver"]),
  // This table will be used later
  rewards: defineTable({
    rewarded_user_id: v.id("users"),
    rewarded_xp: v.number(),
    rewarded_reason: v.id("list_reward_reasons"),
  }),
  abstract_embeddings: defineTable({
    embedding: v.optional(v.array(v.float64())),
  }).vectorIndex("byAbstractEmbedding", {
    vectorField: "embedding",
    dimensions: 768,
  }),
  snippets: defineTable({
    title: v.string(),
    likes_count: v.number(),
    requested_by: v.optional(v.id("users")),
    requestor_name: v.string(),
    type: v.optional(v.id("list_snippet_types")),
    model_used: v.optional(v.string()),
    topic_generated: v.optional(v.string()),
    data: v.object({
      what: v.array(v.string()),
      when: v.array(v.string()),
      where: v.array(v.string()),
      why: v.array(v.string()),
      how: v.array(v.string()),
      amazingfacts: v.array(v.string()),
    }),
    references: v.optional(
      v.array(
        v.object({
          link: v.string(),
          title: v.string(),
          description: v.string(),
        })
      )
    ),
    abstract: v.optional(v.string()),
    abstract_embedding_id: v.optional(v.id("abstract_embeddings")),
    tags: v.optional(v.array(v.string())),
  })
    .index("byLikesCount", ["likes_count"])
    .index("byAbstractEmbeddingId", ["abstract_embedding_id"]),
  likes: defineTable({
    snippet_id: v.id("snippets"),
    liked_by: v.id("users"),
  }).index("bySnippetIdAndLikedBy", ["snippet_id", "liked_by"]),
  saves: defineTable({
    snippet_id: v.id("snippets"),
    saved_by: v.id("users"),
  })
    .index("bySavedBy", ["saved_by"])
    .index("bySnippetIdAndSavedBy", ["snippet_id", "saved_by"]),
  notes: defineTable({
    snippet_id: v.id("snippets"),
    noted_by: v.id("users"),
    note: v.string(),
  })
    .index("byNotedby", ["noted_by"])
    .index("bySnippetIdAndNotedBy", ["snippet_id", "noted_by"])
    .searchIndex("searchNote", {
      searchField: "note",
      filterFields: ["noted_by"],
    }),
  // TODO: Add index later if required
  list_notification_types: defineTable({
    notification_type: v.string(),
  }),
  // TODO: Add index later if required
  list_snippet_types: defineTable({
    snippet_type: v.string(),
  }),
  // This table will be used later
  list_reward_reasons: defineTable({
    reward_reason: v.string(),
  }),
});
