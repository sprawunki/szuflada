<script lang="ts">
  import { base } from "$app/paths";
  import { bookmarkList, bookmarkProgress } from "$lib/store";
  import Bookmark from "$lib/Bookmark.svelte";
  import Progress from "$lib/Progress.svelte";
</script>

<div class="bookmarks">
  <header>
    <h1>Bookmarks ({$bookmarkList.length})</h1>

    <Progress progress={$bookmarkProgress} />
  </header>

  <div class="bookmarklist">
    {#each $bookmarkList as bookmark}
      <div id={bookmark["@id"]}>
        <Bookmark {bookmark} />
      </div>
    {/each}
  </div>
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
</style>
