<script lang="ts">
  import { onMount } from 'svelte';
  import { connect, disconnect, remoteStorage, getBookmarks } from '$lib/remotestorage.ts'

  import { bookmarks } from '$lib/store'

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

    remoteStorage.on("connected", () => {
      getBookmarks()
    })

    worker.onmessage = (event) => bookmarks.set(event.data)
  })
</script>

<div>
  {#if remote.connected}
    <span>{remote.userAddress}</span>
    <button on:click={handleDisconnect}>Disconnect</button>
  {:else}
    <form on:submit|preventDefault={handleConnect}>
      <input type="email" id="address" name="address" value=""/>
      <input type="submit" value="Connect"/>
    </form>
  {/if}
</div>
