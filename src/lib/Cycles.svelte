<script lang="ts">
  import { cycles } from "$lib/store";
  import { getTask, saveTask } from "$lib/remotestorage.ts";
  import TaskTitle from "$lib/TaskTitle.svelte";

  const chooseFirst = async (firstTask) => {
    $cycles[0].forEach(async (taskId) => {
      const task = await getTask(taskId);

      task["moreImportantThan"] = task["moreImportantThan"].filter(
        (dependency) => dependency["@id"] != firstTask["@id"],
      );

      saveTask(task);
    });
  };
</script>

{#if $cycles.length}
  <div class="cycles">
    <span>Which is <em>the most important</em>?</span>
    <ul>
      {#each $cycles[0] as task}
        <li on:click={chooseFirst(task)}>
          <TaskTitle id={task} />
        </li>
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
    cursor: pointer;
  }
</style>
