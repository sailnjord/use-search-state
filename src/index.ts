import { useEffect, useRef, useState } from "react";

const searchParamsToRecord = (searchParams: URLSearchParams) => {
  const paramsRecord: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    paramsRecord[key] = value;
  });
  return paramsRecord;
};

type StateValueType = string | number | null | undefined;
type StateType<T extends string | number | symbol> = {
  [k in T]?: StateValueType;
};
type SearchType<T extends string | number | symbol> = {
  [k in T]?: string;
};

const useSearchState = <T extends string | number | symbol>(
  state: StateType<T>,
  onSearchChanged: (search: SearchType<T>) => void,
  serializeEmptyValues?: boolean
) => {
  const search = typeof window !== "undefined" ? window.location.search : undefined;
  const lastPushedSearch = useRef<string>();
  const [initialParsed, setInitialParsed] = useState(false);

  // Parse location search to local state
  const onSearchStateChangedRef = useRef(onSearchChanged);
  onSearchStateChangedRef.current = onSearchChanged;
  useEffect(() => {
    if ((search === "" ? "?" : search) === lastPushedSearch.current) {
      return;
    }

    const paramsRecord = searchParamsToRecord(new URLSearchParams(search));
    onSearchStateChangedRef.current(paramsRecord);
    setInitialParsed(true);
  }, [lastPushedSearch, search, setInitialParsed]);

  // Update local state on browser navigation
  useEffect(() => {
    const callback = (ev: PopStateEvent) => {
      onSearchStateChangedRef.current(ev.state);
      lastPushedSearch.current = undefined;
    };
    window.addEventListener("popstate", callback);
    return () => {
      window.addEventListener("popstate", callback);
    };
  }, []);

  // Update location search from local state
  useEffect(() => {
    if (!initialParsed) {
      return;
    }

    const newSearchParams = Object.fromEntries(
      Object.entries<StateValueType>(state)
        .filter(([key, value]) => serializeEmptyValues || value != null)
        .map(([key, value]) => [key, value != null ? value.toString() : ""])
    );

    const locSearch = `?${new URLSearchParams(newSearchParams).toString()}`;
    if (locSearch === lastPushedSearch.current) {
      return;
    }
    lastPushedSearch.current = locSearch;

    if (search === "") {
      window.history.replaceState(state, "", locSearch);
    } else if (locSearch !== search || JSON.stringify(state) !== JSON.stringify(window.history.state)) {
      window.history.pushState(state, "", locSearch);
    }
  }, [state, initialParsed, serializeEmptyValues, search]);
};

export default useSearchState;
