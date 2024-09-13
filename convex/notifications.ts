import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get notifications
export const getNotificationsByUserId = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .order("desc")
      .filter((q) => q.eq(q.field("notification_receiver"), args.userId))
      .take(15)

    const result = await Promise.all(notifications.map(async (notification) => {
      const notificationType = await ctx.db
        .query("list_notification_types")
        .filter((q) => q.eq(q.field("_id"), notification.notification_type))
        .first();

      return {
        ...notification,
        notification_type_name: notificationType?.notification_type
      };
    }));

    return result;
  }
});

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
