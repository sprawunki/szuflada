<script>
  import { default as moment } from "moment";
  import Lazy from "svelte-lazy";
  import { bookmarks } from "$lib/store";

  export let id;

  let bookmark;
  let title = "";
  let url = "";
  let createdAt = "";

  $: bookmark = $bookmarks[id];
  $: title = bookmark["http://www.w3.org/2002/01/bookmark#title"]
    ? Array.isArray(bookmark["http://www.w3.org/2002/01/bookmark#title"])
      ? bookmark["http://www.w3.org/2002/01/bookmark#title"][0]["@value"]
      : bookmark["http://www.w3.org/2002/01/bookmark#title"]["@value"]
    : "...";
  $: url = bookmark["http://www.w3.org/2002/01/bookmark#recalls"]
    ? new URL(
        bookmark["http://www.w3.org/2002/01/bookmark#recalls"]["@id"],
      ).toString()
    : "...";
  $: createdAt = bookmark["http://purl.org/dc/elements/1.1/#created"]
    ? bookmark["http://purl.org/dc/elements/1.1/#created"]
    : null;
</script>

<article class="bookmark">
  <Lazy height="4lh">
    <h1 class="bookmark__title">
      {title}
    </h1>
    <span class="bookmark__meta">
      {#if createdAt}
        <span>created</span>
        <span title={moment(createdAt).calendar()}
          >{moment(createdAt).fromNow()}</span
        >
      {:else}
        <span>...</span>
      {/if}
    </span>
    <ul class="bookmark__actions">
      <li class="action">
        <a
          class="action__visit"
          target="_blank"
          rel="noreferrer noopener"
          href={url}
        >
          {url}
        </a>
      </li>
    </ul>
  </Lazy>
</article>

<style>
  .bookmark {
    padding: 0.5lh;
    margin: 0.5lh 0;
    background: var(--slight-shade);
  }

  .bookmark__actions li {
    display: flex;
  }

  .bookmark h1 {
    text-align: left;
    width: 100%;
    font-size: 1em;
    margin: 0;
    font-weight: bold;
  }

  .bookmark__meta {
    margin: 0;
    padding: 0;
    color: var(--gray);
    font-size: 0.5lh;
    display: block;
    text-align: right;
  }

  .bookmark__meta dt,
  .bookmark__meta dd {
    display: inline;
    margin: 0;
    padding: 0;
  }

  .bookmark__meta dt::after {
    content: "\020";
  }

  .bookmark__actions {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bookmark__actions li {
    margin: 0;
    padding: 0;
  }

  .action {
    max-width: 100%;
  }

  .action__visit {
    font-size: 0.5lh;
    overflow: hidden;
  }
</style>
