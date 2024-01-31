<script lang="ts">
  import { onMount } from 'svelte';
  import { connect, disconnect, remoteStorage, getBookmarks, getTasks } from '$lib/remotestorage.ts'

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

    remoteStorage['szuflada.app/bookmark'].getPrivateClient().on('change', (event: any) => {
      worker.postMessage(event)
    })

    remoteStorage['szuflada.app/task'].getPrivateClient().on('change', (event: any) => {
      tasks.update(t => {
        if(event.oldValue && event.oldValue['@id']) {
          delete t[event.oldValue['@id']];
        }

        if(event.newValue && event.newValue['@id']) {
          t[event.newValue['@id']] = event.newValue;
        }

        return t;
      })
    })

    remoteStorage.on("connected", () => {
      getBookmarks()
      getTasks()
    })

    worker.onmessage = (event) => bookmarks.set(event.data)
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
