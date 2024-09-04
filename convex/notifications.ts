import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new notification
export const createNotification = mutation({
  args: {
    notification_creator: v.optional(v.id("users")),
    notification_receiver: v.optional(v.id("users")),
    notification_type: v.optional(v.id("list_notification_types")),
    notification: v.string()
  },
  handler: async (ctx, args) => {
    const newNotificationId = await ctx.db.insert("notifications", {
      notification_creator: args.notification_creator,
      notification_receiver: args.notification_receiver,
      notification_type: args.notification_type,
      notification: args.notification,
      is_read: false,
      is_cleared: false,
    });

    return newNotificationId;
  },
});
