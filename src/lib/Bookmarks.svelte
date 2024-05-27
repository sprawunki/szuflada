<script lang="ts">
  import { base } from "$app/paths"
  import { bookmarkList, bookmarkProgress } from '$lib/store'
  import Bookmark from '$lib/Bookmark.svelte'
</script>

<div class="bookmarks">
  <div class="progress">
    <div class="progressBar" style={`width: ${$bookmarkProgress*100}%; transition: width ${+!!$bookmarkProgress}s;`}></div>
  </div>

  <h2>Bookmarks ({$bookmarkList.length})</h2>

  <div class='bookmarklist'>
  {#each $bookmarkList as bookmark}
  <div id={bookmark['@id']}>
    <Bookmark bookmark={bookmark} />
  </div>
  {/each}
  </div>
</div>

<style>
  .progressBar {
    background: #0cc;
    height: 0.125rem;
  }

  .progress {
    position: sticky;
    top: 0;
    right: 0;
    left: 0;
    background: #077;
  }

  .bookmarks {
    max-width: 100%;
    overflow-wrap: break-word;
    padding: 0 0 1.5rem;
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
