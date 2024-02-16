<script lang="ts">
  import { bookmarkList } from '$lib/store'
  import { default as moment } from 'moment'
</script>

<div class="bookmarks">
  <h2>Bookmarks ({$bookmarkList.length})</h2>
  <ul class='bookmarklist'>
  {#each $bookmarkList as bookmark}
  <li class="bookmark" id={bookmark['@id']}>
    <h3 class="bookmark__title">
      {bookmark['bookmark:title']}
    </h3>
    <dl class="bookmark__meta">
      <dt>created</dt>
      <dd title="{moment(bookmark['dc:created']).calendar()}">{moment(bookmark['dc:created']).fromNow()}</dd>
    </dl>
    <ul class="bookmark__actions">
      <li class="action">
        {#if bookmark['bookmark:recalls'] && bookmark['bookmark:recalls']['@id']}
        <a class="action__visit" target="_blank" rel="noreferrer noopener" href={bookmark['bookmark:recalls']['@id']}>
          {bookmark['bookmark:recalls']['@id']}
        </a>
        {:else}
        <em>Unavailable: {bookmark['@id']}</em>
        {/if}
      </li>
    </ul>
  </li>
  {/each}
  </ul>
</div>

<style>
  .bookmarks {
    max-width: 100%;
    overflow-wrap: break-word;
  }

  .bookmarks a {
    hyphens: auto;
    max-width: 100%;
  }

  .bookmarklist,
  .bookmark__actions {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .bookmarklist li,
  .bookmark__actions li {
    margin: 0;
    padding: 0;
  }

  .action {
    max-width: 100%;
  }

  .bookmark {
    padding: 0.125em 0;
  }

  .bookmark::after {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    margin: 0.5rem auto;
    background: #ccc;
  }

  .bookmark__actions li {
    display: flex;
  }

  .bookmark h3 {
    width: 100%;
    font-size: 1.25rem;
    margin: 0;
  }

  .bookmark__meta {
    margin: 0;
    padding: 0;
    color: #666;
    font-size: 0.75rem;

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
    content: '\020';
  }
</style>
