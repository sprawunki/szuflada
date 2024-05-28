<script>
    import { default as moment } from 'moment'

    import * as jsonld from 'jsonld'
    import { bookmarkContext } from '$lib/jsonld/contexts'

    export let bookmark = {}

    let title = ''
    let url = ''
    let createdAt = ''

    $:  title = bookmark['http://www.w3.org/2002/01/bookmark#title'] ?
            Array.isArray(bookmark['http://www.w3.org/2002/01/bookmark#title']) ?
                bookmark['http://www.w3.org/2002/01/bookmark#title'][0]['@value'] :
                bookmark['http://www.w3.org/2002/01/bookmark#title']['@value'] :
            '...'
        url = bookmark['http://www.w3.org/2002/01/bookmark#recalls'] ?
            new URL(bookmark['http://www.w3.org/2002/01/bookmark#recalls']['@id']).toString() :
            '...'
        createdAt = bookmark['http://purl.org/dc/elements/1.1/#created'] ?
            bookmark['http://purl.org/dc/elements/1.1/#created'] :
            null
</script>

<article class="bookmark">
    <h1 class="bookmark__title">
      { title }
    </h1>
    <span class="bookmark__meta">
      {#if createdAt}
      <span>created</span>
      <span title="{moment(createdAt).calendar()}">{moment(createdAt).fromNow()}</span>
      {:else}
      <span>...</span>
      {/if}
    </span>
    <ul class="bookmark__actions">
      <li class="action">
        <a class="action__visit" target="_blank" rel="noreferrer noopener" href={url}>
          {url}
        </a>
      </li>
    </ul>
</article>

<style>
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
    color: #777;
    font-size: 0.75em;
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
    font-size: 0.75em;
    overflow: hidden;
  }
</style>