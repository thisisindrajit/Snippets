// in hooks/useStableQuery.ts
import { useRef } from "react";
import { usePaginatedQuery } from "convex/react";

const useStablePaginatedQuery = ((name, ...args) => {
  const result = usePaginatedQuery(name, ...args);
  const stored = useRef(result);

  // If new data is still loading, wait and do nothing
  // If data has finished loading, use the ref to store it
  if (result.status !== "LoadingMore") {
    stored.current = result;
  }

  return stored.current;
}) as typeof usePaginatedQuery;

export default useStablePaginatedQuery;
