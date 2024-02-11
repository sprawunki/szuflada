<script lang="ts">
  import { onMount } from 'svelte';
  import { connect, disconnect, remoteStorage, getBookmarkList, getTasks, getBookmark, putIndex, getIndices } from '$lib/remotestorage.ts'

  import { bookmarks, tasks } from '$lib/store'

  let remote = remoteStorage.remote

  remoteStorage.on("connected", () => {
    console.log("connected")
    remote = remoteStorage.remote
  })

  remoteStorage.on("disconnected", () => {
    console.log("disconnected")
    remote = remoteStorage.remote
  })

  const handleConnect = (event)  => {
    const formData = new FormData(event.target);
    connect(formData.get('address'))
  }

  const handleDisconnect = () => {
    disconnect()
  }

  onMount(async () => {
    const StateWorker = await import('$lib/state.worker?worker')
    const worker = new StateWorker.default()

    remoteStorage['szuflada.app/index'].getPrivateClient().on('change', (event: any) => {
      worker.postMessage(event)
    })

    remoteStorage['szuflada.app/bookmark'].getPrivateClient().on('change', (event: any) => {
      worker.postMessage(event)
    })

    remoteStorage['szuflada.app/task'].getPrivateClient().on('change', (event: any) => {
      tasks.update(task => {
        if(event.oldValue && event.oldValue['@id']) {
          delete task[event.oldValue['@id']];
        }

        if(event.newValue && event.newValue['@id']) {
          task[event.newValue['@id']] = event.newValue;
        }

        return task;
      })
    })

    remoteStorage.on("connected", () => {
      getIndices()
      getTasks()
    })

    const fetchBookmarks = () => getBookmarkList()
      .then(bookmarks => bookmarks ? Object.keys(bookmarks) : [])
      .then(bookmarkIds => [
        Object.keys($bookmarks).filter(bookmarkId => !bookmarkIds.includes(bookmarkId)),
        bookmarkIds.filter(bookmarkId => !$bookmarks[bookmarkId])
      ])
      .then(bookmarkIds => [
        bookmarkIds[0],
        bookmarkIds[1].slice(0, 16)
      ])
      .then(bookmarkIds => {
        bookmarkIds[0].forEach(
          bookmarkId => worker.postMessage({ oldValue: { "@id": bookmarkId } })
        )
        bookmarkIds[1].forEach(
          bookmarkId => getBookmark(bookmarkId)
            .then(bookmark => worker.postMessage({ newValue: bookmark }))
        )
      })

    let refreshInterval

    worker.onmessage = (event) => {
      clearInterval(refreshInterval)

      for (const indexKey in event.data.indices.bookmarks) {
        putIndex(indexKey, event.data.indices.bookmarks[indexKey])
      }

      bookmarks.set(event.data.bookmarks)

      fetchBookmarks()

      refreshInterval = setInterval(
        fetchBookmarks,
        30000
      )
    }
  })
</script>

<div class="remotestorage">
  {#if remote.connected}
    <span class="current-user">{remote.userAddress}</span>
    <button on:click={handleDisconnect}>Disconnect</button>
  {:else}
    <form on:submit|preventDefault={handleConnect}>
      <input type="email" id="address" name="address" value=""/>
      <input type="submit" value="Connect"/>
    </form>
  {/if}
</div>

<style>
  .remotestorage {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 0 0.25rem;
    overflow: hidden;
  }

  .current-user {
    padding: 0.25rem;
    hyphens: auto;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
