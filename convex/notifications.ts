import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get notifications
export const getNotificationsByUserId = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const { userId } = args;

    if (!userId) {
      console.error("userId not provided!");
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("byNotificationReceiver", (q) =>
        q.eq("notification_receiver", userId)
      )
      .order("desc")
      .take(10);

    const result = await Promise.all(
      notifications.map(async (notification) => {
        const notificationType = await ctx.db
          .query("list_notification_types")
          .filter((q) =>
            q.eq(q.field("notification_type"), notification.notification_type)
          )
          .unique();

        return {
          ...notification,
          notification_type_name: notificationType?.notification_type,
        };
      })
    );

    return result;
  },
});

// Create a new notification
export const createNotification = mutation({
  args: {
    notification_creator: v.optional(v.id("users")),
    notification_receiver: v.id("users"),
    type: v.string(),
    notification: v.string(),
  },
  handler: async (ctx, args) => {
    const { notification_creator, notification_receiver, type, notification } =
      args;

    const newNotificationId = await ctx.db.insert("notifications", {
      notification_creator: notification_creator,
      notification_receiver: notification_receiver,
      notification_type: (
        await ctx.db
          .query("list_notification_types")
          .filter((q) => q.eq(q.field("notification_type"), type))
          .unique()
      )?._id,
      notification: notification,
    });

    return newNotificationId;
  },
});
