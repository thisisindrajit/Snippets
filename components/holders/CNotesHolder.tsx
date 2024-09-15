"use client";

import { ChangeEvent, Fragment, useEffect, useState } from "react";
import { Authenticated, AuthLoading } from "convex/react";
import { Input } from "../ui/input";
import CAllNotes from "../CAllNotes";
import CSearchedNotes from "../CSearchedNotes";

const CNotesHolder = () => {
  const [notesCount, setNotesCount] = useState<number | null>(null);
  const [isOnlySearchResults, setIsOnlySearchResults] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    // debounce the set state
    const timeout = setTimeout(() => {
      setIsOnlySearchResults(searchQuery.length > 0);
    }, 1000);

    return () => clearTimeout(timeout);
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
          <Input
            type="text"
            placeholder="Search through your notes..."
            value={searchQuery}
            onChange={(e) => changeHandler(e)}
            className="focus-visible:ring-primary focus-visible:outline-none border border-primary"
          />
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
