<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { connect, disconnect, remoteStorage } from "$lib/remotestorage.ts";

  import { bookmarks, tasks, productProgress, products } from "$lib/store";

  import search from "$lib/search";

  const workers = {};

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

  onMount(async () => {
    const IndexWorker = await import("$lib/index.worker?worker");
    workers.index = new IndexWorker.default();

    workers.index.onmessage = (event) => {
      if (event.data.hasOwnProperty("progress")) {
        productProgress.set(event.data.progress);
      }

      if (event.data.hasOwnProperty("products")) {
        products.set(
          Object.fromEntries(
            (event.data.products["schema:demands"] ?? []).map((item) => [
              item["@id"],
              item,
            ]),
          ),
        );
      }
    };

    remoteStorage["szuflada.app/bookmark"]
      .getPrivateClient()
      .on("change", (event: any) => {
        if (event.newValue) {
          search.add({
            "@id": event.newValue["@id"],
            title:
              event.newValue["http://www.w3.org/2002/01/bookmark#title"][
                "@value"
              ],
            recalls:
              event.newValue["http://www.w3.org/2002/01/bookmark#recalls"][
                "@id"
              ],
          });
        }

        bookmarks.update((bookmark) => {
          if (event.oldValue && event.oldValue["@id"]) {
            delete bookmark[event.oldValue["@id"]];
          }

          if (event.newValue && event.newValue["@id"]) {
            bookmark[event.newValue["@id"]] = event.newValue;
          }

          return bookmark;
        });

        workers.index.postMessage(event);
      });

    remoteStorage["szuflada.app/task"]
      .getPrivateClient()
      .on("change", (event: any) => {
        tasks.update((task) => {
          if (event.oldValue && event.oldValue["@id"]) {
            delete task[event.oldValue["@id"]];
          }

          if (event.newValue && event.newValue["@id"]) {
            task[event.newValue["@id"]] = event.newValue;
          }

          return task;
        });
      });
  });

  onDestroy(() => {
    for (const worker in workers) {
      workers[worker].terminate();
    }
  });
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
