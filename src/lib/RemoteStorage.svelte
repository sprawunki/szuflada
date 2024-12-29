<script lang="ts">
  import { connect, disconnect, remoteStorage } from "$lib/remotestorage.ts";

  let remote = remoteStorage.remote;

  remoteStorage.on("connected", () => {
    remote = remoteStorage.remote;
  });

  remoteStorage.on("disconnected", () => {
    remote = remoteStorage.remote;
  });

  const handleConnect = (event) => {
    const formData = new FormData(event.target);
    connect(formData.get("address"));
  };

  const handleDisconnect = () => {
    disconnect();
  };
</script>

<div class="remotestorage">
  {#if remote.connected}
    <span class="current-user">{remote.userAddress}</span>
    <button on:click={handleDisconnect}>Disconnect</button>
  {:else}
    <form on:submit|preventDefault={handleConnect}>
      <input type="email" id="address" name="address" value="" />
      <input type="submit" value="Connect" />
    </form>
  {/if}
</div>

<style>
  .remotestorage {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 0 1lh;
    overflow: hidden;
    flex-grow: 1;
  }

  form {
    display: flex;
    flex: 1;
  }

  .current-user {
    hyphens: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  input {
    background: var(--delicate-gray);
    color: var(--foreground-color);
    border: none;
    flex: 1;
    width: 100%;
  }

  button,
  input[type="submit"] {
    cursor: pointer;
    appearance: none;
    background: var(--accent-color);
    color: var(--background-color);
    border: none;
    padding: 0.5lh;
    flex: 0;
  }

  button:hover,
  input[type="submit"]:hover {
    background: var(--background-color);
    color: var(--accent-color);
  }
</style>
