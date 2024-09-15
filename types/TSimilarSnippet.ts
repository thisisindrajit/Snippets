import { Id } from "../convex/_generated/dataModel";

export type TSimilarSnippet = {
  _id: Id<"snippets">;
  title: string;
  abstract: string;
  tags: string[];
};
