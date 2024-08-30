import { query } from "./_generated/server";
import { v } from "convex/values";

export const getNotificationTypeDetails = query({
  args: {
    notificationType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("list_notification_types")
      .filter((q) => q.eq(q.field("notification_type"), args.notificationType))
      .first();
  },
});
