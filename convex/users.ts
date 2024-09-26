import { internalMutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import { internal } from "./_generated/api";

export const getUserByExternalId = query({
  args: {
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { externalId } = args;

    if (!externalId) {
      console.error("externalId not provided!");
      return null;
    }

    return await userByExternalId(ctx, externalId);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      externalId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
      primaryEmail: data.email_addresses[0].email_address,
      totalRewards: 0,
    };

    const user = await userByExternalId(ctx, data.id);
    
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
      await ctx.scheduler.runAfter(
        0,
        internal.welcome_email_internal_action.sendWelcomeEmail,
        {
          firstName: userAttributes.firstName ?? undefined,
          email: userAttributes.primaryEmail,
        }
      );
    } else {
      userAttributes.totalRewards = user.totalRewards;
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user Id: ${clerkUserId}`
      );
    }
  },
});

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}
