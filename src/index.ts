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

// Insert the state provided to this hook into
// history.state under this custom sub-key to
// retain what other put in history.state
const HISTORY_STATE_KEY = "__sailnjord__use-search-state";

const useSearchState = <T extends string | number | symbol>(
  state: StateType<T>,
  onSearchChanged: (search: SearchType<T>) => void,
  serializeEmptyValues?: boolean
) => {
  const currentSearch = typeof window !== "undefined" ? window.location.search || "?" : undefined;
  const lastPushedSearch = useRef<string>();
  const [initialParsed, setInitialParsed] = useState(false);
  const initialPushed = useRef(false);

  // Parse location search to local state
  const onSearchStateChangedRef = useRef(onSearchChanged);
  onSearchStateChangedRef.current = onSearchChanged;
  useEffect(() => {
    if (currentSearch === lastPushedSearch.current) {
      return;
    }

    const paramsRecord = searchParamsToRecord(new URLSearchParams(currentSearch));
    onSearchStateChangedRef.current(paramsRecord);
    setInitialParsed(true);
  }, [lastPushedSearch, currentSearch, setInitialParsed]);

  // Update local state on browser navigation
  useEffect(() => {
    const callback = (ev: PopStateEvent) => {
      onSearchStateChangedRef.current(ev.state?.[HISTORY_STATE_KEY] || {});
      lastPushedSearch.current = undefined;
    };
    window.addEventListener("popstate", callback);
    return () => {
      window.removeEventListener("popstate", callback);
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
    const newSearch = `?${new URLSearchParams(newSearchParams).toString()}`;

    if (newSearch === lastPushedSearch.current) {
      return;
    }

    const url = new URL(window.location.href);
    url.search = newSearch;

    const newState = {
      ...window.history.state,
      [HISTORY_STATE_KEY]: state,
    };
    if (!initialPushed.current) {
      window.history.replaceState(newState, "", url.toString());
      initialPushed.current = true;
      lastPushedSearch.current = newSearch;
    } else if (
      newSearch !== currentSearch ||
      JSON.stringify(state) !== JSON.stringify(window.history.state?.[HISTORY_STATE_KEY] || {})
    ) {
      window.history.pushState(newState, "", url.toString());
      lastPushedSearch.current = newSearch;
    }
  }, [state, initialParsed, initialPushed, serializeEmptyValues, currentSearch]);
};

export default useSearchState;
