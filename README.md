# use-search-state

<p>
    <a aria-label="NPM version" href="https://www.npmjs.com/package/@sailnjord/use-search-state">
    <img alt="" src="https://badgen.net/npm/v/@sailnjord/use-search-state">
  </a>
  <a aria-label="Package size" href="https://bundlephobia.com/result?p=@sailnjord/use-search-state">
    <img alt="" src="https://badgen.net/bundlephobia/minzip/@sailnjord/use-search-state">
  </a>
  <a aria-label="License" href="https://github.com/@sailnjord/use-search-state/blob/main/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/@sailnjord/use-search-state">
  </a>
</p>

## Usage

```typescript
useSearchState(
  // Send any state to the search/query string
  // Changing this value will cause a pushState()
  {
    foo: 123,
    bar: 42,
  },
  // Handle changes in the search/query string
  // (called once for the initial page load, and for
  // subsequent changes including on forward/back
  // navigation by the user)
  ({ foo, bar }) => {
    // For example, copy to local state:
    // setFoo(foo)
    // setBar(bar)
  },
  // Do not serialize empty values (e.g. ?foo=)
  false
);
```
