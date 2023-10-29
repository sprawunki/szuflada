<script lang="ts">
  import { bookmarkList } from '$lib/store'
  import { default as moment } from 'moment'
</script>

<div class="bookmarks">
  <h2>Bookmarks</h2>
  <ul class='bookmarklist'>
  {#each $bookmarkList as bookmark}
  <li class="bookmark" id={bookmark['@id']}>
    <div class="bookmark__title">
      {bookmark.title}
    </div>
    <dl class="bookmark__meta">
      <dt>created</dt>
      <dd title="{moment(bookmark.created).calendar()}">{moment(bookmark.created).fromNow()}</dd>
    </dl>
    <ul class="bookmark__actions">
      <li class="action">
        <a class="action__visit" target="_blank" rel="noreferrer noopener" href={bookmark.recalls['@id']}>
          {bookmark.recalls['@id']}
        </a>
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
    padding: 0.25em 0;
  }

  .bookmark::after {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    margin: 1rem auto;
    background: #ccc;
  }

  .bookmark__actions li {
    display: flex;
  }

  .bookmark__title {
    width: 100%;
    font-size: 1.5rem;
    margin: 0;
  }

  .bookmark__meta {
    margin: 0 0 0.5em;
    padding: 0;
    color: #666;

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
