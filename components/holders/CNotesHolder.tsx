"use client";

import { ChangeEvent, Fragment, useEffect, useState } from "react";
import { Authenticated, AuthLoading } from "convex/react";
import { Input } from "../ui/input";
import CAllNotes from "../notes/CAllNotes";
import CSearchedNotes from "../notes/CSearchedNotes";
import { Info } from "lucide-react";

const CNotesHolder = () => {
  const [notesCount, setNotesCount] = useState<number | null>(null);
  const [isOnlySearchResults, setIsOnlySearchResults] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (searchQuery.length === 0) {
      setIsOnlySearchResults(false);
    } else {
      // debounce the set state
      const timeout = setTimeout(() => {
        setIsOnlySearchResults(searchQuery.trim().length > 0);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [searchQuery]);

  return (
    <Fragment>
      <AuthLoading>
        <div className="w-full text-center my-2">
          Checking if you are authenticated 🧐
        </div>
      </AuthLoading>
      <Authenticated>
        {notesCount && notesCount > 0 ? (
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="Search through your notes..."
              value={searchQuery}
              onChange={(e) => changeHandler(e)}
              className="focus-visible:ring-primary focus-visible:outline-none border border-primary text-base"
            />
            <div className="flex gap-1 items-center text-neutral-500 text-sm">
              <Info className="h-4 w-4" />
              Clear the search query to view all notes
            </div>
          </div>
        ) : null}
        {isOnlySearchResults ? (
          <CSearchedNotes searchQuery={searchQuery} />
        ) : (
          <CAllNotes setNotesCount={setNotesCount} />
        )}
      </Authenticated>
    </Fragment>
  );
};

export default CNotesHolder;
