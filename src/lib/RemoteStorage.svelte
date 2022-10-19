<script lang="ts">
  import { connect, disconnect, remoteStorage } from '$lib/remotestorage.ts'

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
