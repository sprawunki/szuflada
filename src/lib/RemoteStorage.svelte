<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { connect, disconnect, remoteStorage, getBookmarkList, getTasks, getBookmark, putIndex, getIndices } from '$lib/remotestorage.ts'

  import { bookmarks, tasks } from '$lib/store'

  const workers = {}

  let remote = remoteStorage.remote

  remoteStorage.on("connected", () => {
    remote = remoteStorage.remote
  })

  remoteStorage.on("disconnected", () => {
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
    workers.state = new StateWorker.default()

    remoteStorage['szuflada.app/index'].getPrivateClient().on('change', (event: any) => {
      workers.state.postMessage(event)
    })

    remoteStorage['szuflada.app/bookmark'].getPrivateClient().on('change', (event: any) => {
      workers.state.postMessage(event)
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
        Object.values(Object.groupBy(bookmarkIds[1], (id: string) => id[9]))
      ])
      .then(bookmarkIds => [
        bookmarkIds[0],
        bookmarkIds[1][parseInt(Math.random() * bookmarkIds[1].length)] ?? []
      ])
      .then(bookmarkIds => [
        bookmarkIds[0],
        bookmarkIds[1]
      ])
      .then(bookmarkIds => {
        bookmarkIds[0].forEach(
          bookmarkId => workers.state.postMessage({
            newValue: undefined,
            oldValue: { "@id": bookmarkId }
          })
        )
        bookmarkIds[1].forEach(
          bookmarkId => getBookmark(bookmarkId)
            .then(bookmark => workers.state.postMessage({
              newValue: bookmark,
              oldValue: undefined
            }))
        )
      })

    let refresh

    workers.state.onmessage = (event) => {
      getIndices()

      clearTimeout(refresh)

      for (const indexKey in event.data.indices.bookmarks) {
        putIndex(indexKey, event.data.indices.bookmarks[indexKey])
      }

      bookmarks.set(event.data.bookmarks)

      refresh = setTimeout(
        fetchBookmarks,
        5000
      )
    }
  })

  onDestroy(() => {
    for (const worker in workers) {
      workers[worker].terminate()
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
