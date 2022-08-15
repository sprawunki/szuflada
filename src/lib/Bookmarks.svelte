<script lang="ts">
  import { onDestroy } from 'svelte'
  import { remoteStorage } from '$lib/remotestorage'
  import { bookmarks } from '$lib/store'

  // let bookmarkList
  //
  // const unsubscribe = bookmarks.subscribe(value => {
  //   bookmarkList = value
  // })
  //
  // onDestroy(unsubscribe)

  // console.log(remoteStorage['szuflada.app/WebPage'].getList())

  remoteStorage.on('sync-done', () => {
    remoteStorage['szuflada.app/WebPage'].getList()
  })

  remoteStorage['szuflada.app/WebPage'].getList()
    .then(result => {
      $bookmarks = [...result]
    })

  // remoteStorage.onChange('/', () => {
  //   bookmarks = remoteStorage['szuflada.app/WebPage'].getList()
  // })
</script>

<div>
  <h2>Bookmarks</h2>
  <ul>
  {#each $bookmarks as bookmark}
  <li>
  <a target="_blank" rel="noreferrer noopener" href={bookmark['http://schema.org/url']}>
    {bookmark['http://schema.org/name'][0]['@value']}
  </a>
  </li>
  {/each}
  </ul>
</div>
