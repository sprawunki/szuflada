<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    connect,
    disconnect,
    remoteStorage,
    getBookmarks,
    getBookmarkList,
    getTasks,
    getTaskList,
  } from '$lib/remotestorage.ts'

  import {
    bookmarks,
    tasks,
    productProgress,
    products,
  } from '$lib/store'
  import * as jsonld from 'jsonld'

  import { v5 as uuidv5 } from 'uuid'
  const NS_BOOKMARK = uuidv5("https://szuflada.app/bookmark/", uuidv5.URL)

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
    const IndexWorker = await import('$lib/index.worker?worker')
    workers.index = new IndexWorker.default()

    workers.index.onmessage = (event) => {
      if (event.data.hasOwnProperty('progress')) {
        productProgress.set(event.data.progress)
      }

      if(event.data.hasOwnProperty('products')) {
        products.set(Object.fromEntries((event.data.products['schema:demands'] ?? []).map(item => [item['@id'], item])))
      }
    }

    remoteStorage['szuflada.app/bookmark'].getPrivateClient().on('change', (event: any) => {
      if (event.origin !== 'local') {
        bookmarks.update(bookmark => {
          if(event.oldValue && event.oldValue['@id']) {
            delete bookmark[event.oldValue['@id']];
          }

          if(event.newValue && event.newValue['@id']) {
            bookmark[event.newValue['@id']] = event.newValue;
          }

          return bookmark;
        })
      }

      workers.index.postMessage(event)
    })

    remoteStorage['szuflada.app/task'].getPrivateClient().on('change', (event: any) => {
      if (event.origin !== 'local') {
        tasks.update(task => {
          if(event.oldValue && event.oldValue['@id']) {
            delete task[event.oldValue['@id']];
          }

          if(event.newValue && event.newValue['@id']) {
            task[event.newValue['@id']] = event.newValue;
          }

          return task;
        })
      }
    })

    remoteStorage.on("ready", async () => {
      const parsedUrl = new URL(window.location);

      const title = parsedUrl.searchParams.get('title');
      const text = parsedUrl.searchParams.get('text');
      const url = parsedUrl.searchParams.get('url');

      const getUrlFromCandidate = (candidate) => {
        try {
          return new URL(candidate).toString()
        } catch (e) {
          return null
        }
      }

      const finalUrl = getUrlFromCandidate(url) || getUrlFromCandidate(text)

      if (finalUrl) {
        console.log("SAVING", finalUrl)
        await remoteStorage['szuflada.app/bookmark'].save({
          "@id": `urn:uuid:${uuidv5(finalUrl, NS_BOOKMARK)}`,
          "@type": "http://www.w3.org/2002/01/bookmark#Bookmark",
          "http://purl.org/dc/elements/1.1/#created": new Date().toISOString(),
          "http://purl.org/dc/elements/1.1/#date": new Date().toISOString(),
          "http://www.w3.org/2002/01/bookmark#title": [{
            "@value": title,
          }],
          "http://www.w3.org/2002/01/bookmark#recalls": {
            "@id": finalUrl
          }
        })
      }

      await getTasks()
        .then((allTasks: any) => {
            $tasks = { ...allTasks }
        })
        .then(() => getTaskList())

      await getBookmarks()
        .then((allBookmarks: any) => {
            $bookmarks = { ...allBookmarks }
        })
        .then(() => getBookmarkList())
    })
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
