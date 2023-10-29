<script lang="ts">
  import { cycles } from '$lib/store'
  import { remoteStorage } from '$lib/remotestorage.ts'

  const chooseFirst = (firstTask) => {
    $cycles.forEach(task => {
      task["https://szuflada.app/ns/before"] = task["https://szuflada.app/ns/before"]
        .filter(dependency => dependency["@id"] != firstTask["@id"])

      remoteStorage['szuflada.app/task'].save(task)
    })
  }
</script>

{#if $cycles.length}
<div class="cycles">
  <span>Which is <em>the most important</em>?</span>
  <ul>
    {#each $cycles as task}
      <li on:click={chooseFirst(task)}>{task['https://szuflada.app/ns/summary']}</li>
    {/each}
  </ul>
</div>
{/if}

<style>
  .cycles {
    background-color: #077;
    color: #fff;
    margin: 0;
    padding: 1rem;
    position: sticky;
    top: 0.5rem;
  }
  .cycles a {
    color: inherit;
  }
  .cycles li {
    margin: 0.25em 0;
    padding: 0.25em 0;
  }
</style>
