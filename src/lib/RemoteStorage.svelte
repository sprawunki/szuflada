<script lang="ts">
  import { connect, disconnect } from '$lib/remotestorage.ts'

  const handleConnect = (event)  => {
    const formData = new FormData(event.target);
    connect(formData.get('address'))
  }

  const handleDisconnect = () => {
    disconnect()
  }
</script>

<div>
  <form on:submit|preventDefault={handleConnect}>
    <input type="email" id="address" name="address" value=""/>
    <input type="submit" value="Connect"/>
  </form>
  <button on:click={handleDisconnect}>Disconnect</button>
</div>
