<script>
  import { base } from "$app/paths";
  import { writable } from "svelte/store";
  import { default as moment } from "moment";
  import { bookmarks } from "$lib/store";
  import jsonld from "$lib/jsonld/jsonld";
  import { bookmarkContext } from "$lib/jsonld/contexts";

  export let id;

  const bookmark = writable({});
  const ogp = writable({});

  let bookmarkStore;

  $: bookmarkStore = bookmarks(id);

  $: jsonld
    .frame($bookmarkStore, {
      "@context": bookmarkContext,
      "@type": "bookmark:Bookmark",
      "@requireAll": "@true",
    })
    .then((graph) => bookmark.set(graph));
</script>

<div class="bookmark-wrapper">
  <article class="bookmark">
    <div class="title">
      <h1>
        <a href={`${base}#${id}`} class:loading={!$bookmark["bookmark:title"]}>
          {$bookmark["bookmark:title"]}
        </a>
      </h1>
    </div>

    <div class="details">
      <a
        class="action__visit"
        class:loading={!(
          $bookmark["bookmark:recalls"] && $bookmark["bookmark:recalls"]["@id"]
        )}
        target="_blank"
        rel="noreferrer noopener"
        href={$bookmark["bookmark:recalls"]
          ? $bookmark["bookmark:recalls"]["@id"]
          : ""}
      >
        {$bookmark["bookmark:recalls"]
          ? new URL($bookmark["bookmark:recalls"]["@id"]).host
          : ""}
      </a>

      <div class:loading={!$bookmark["dc:created"]} class="created">
        <span title={moment($bookmark["dc:created"]).calendar()}
          >{moment($bookmark["dc:created"]).fromNow()}</span
        >
      </div>
    </div>
  </article>
</div>

<style>
  small {
    white-space: nowrap;
  }

  h1 {
    height: 2lh;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  h1 a {
    width: 100%;
    display: block;
  }

  .bookmark-wrapper {
    position: relative;
  }

  .bookmark {
    padding: 0.5lh;
    margin: 0;
    background: var(--slight-shade);
    display: grid;
    grid-template-columns: [start] min-content [main] auto [end];
    grid-template-rows: [top] 2lh [bottom] 1lh [end];
    gap: 0.5lh;
  }

  .bookmark header {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bookmark h1 {
    text-align: left;
    width: 100%;
    font-size: 1em;
    margin: 0;
    font-weight: bold;
  }

  .details {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .created {
    font-size: 0.5lh;
    text-align: right;
  }

  .details a {
    flex: 1;
  }

  .loading {
    background: linear-gradient(
      to right,
      var(--delicate-gray),
      rgba(255, 255, 255, 0) 65%
    );
    color: transparent;
  }

  .title {
    grid-area: 1 / start / span 1 / end;
  }

  .details {
    grid-area: 2 / start / span 1 / end;
  }
</style>
