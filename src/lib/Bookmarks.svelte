<script lang="ts">
  import { page } from "$app/stores";
  import { bookmarksFiltered } from "$lib/store";
  import { deleteBookmark } from "$lib/remotestorage";
  import Bookmark from "$lib/Bookmark.svelte";
  import Search from "$lib/Search.svelte";

  let hash;

  const handleDelete = (hash) => deleteBookmark(hash);

  $: hash = $page.url.hash.replace(/^#/, "");
</script>

<div class="bookmarks">
  {#if hash.match(/^urn:uuid:/)}
    <Bookmark id={hash} />

    <div class="actions">
      <button class="danger" on:click={() => handleDelete(hash)}>delete</button>
    </div>
  {:else}
    <header>
      <h1>Bookmarks ({$bookmarksFiltered.length})</h1>
    </header>

    <div class="bookmarklist">
      {#each $bookmarksFiltered as bookmark}
        <div id={bookmark["@id"]}>
          <Bookmark id={bookmark["@id"]} />
        </div>
      {/each}
    </div>

    <div class="actions">
      <Search />
    </div>
  {/if}
</div>

<style>
  header {
    position: sticky;
    top: 0;
    overflow: hidden;
    background: var(--background-color);
    z-index: 1;
  }

  .bookmarks {
    margin: 0;
    padding: 0;
  }

  .bookmarks a {
    hyphens: auto;
    max-width: 100%;
  }

  .bookmarklist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bookmarklist li {
    margin: 0;
    padding: 0;
  }

  .actions {
    position: sticky;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(127, 127, 127, 0),
      var(--background-color) 4lh
    );
    padding: 4.5lh 1lh 0.5lh;
    margin: 0 -1lh;
    text-align: right;
  }

  .danger {
    color: var(--danger-color);
    background: transparent;
    border: none;
    cursor: pointer;
  }
</style>
