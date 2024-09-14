import { Cursor } from "convex/server";

export interface IPaginationResult<T> {
  /**
   * The page of results.
   */
  page: T[];

  /**
   * Have we reached the end of the results?
   */
  isDone: boolean;

  /**
   * A {@link Cursor} to continue loading more results.
   */
  continueCursor: Cursor;

  splitCursor?: null | string;

  pageStatus?: null | "SplitRecommended" | "SplitRequired"
}
