<script lang="ts">
  import { tasksSorted } from "$lib/store";
  import CompareTasks from "$lib/CompareTasks.svelte";
  import TaskSummary from "$lib/TaskSummary.svelte";
  import Cycles from "$lib/Cycles.svelte";
</script>

<div class="tasks">
  <header>
    <h1>
      Tasks ({$tasksSorted.filter((task) => !task.done)
        .length}/{$tasksSorted.length})
    </h1>

    <CompareTasks />
    <Cycles />
  </header>

  <ul>
    {#if false}
      <pre><code>{JSON.stringify($tasksSorted, null, 2)}</code></pre>
    {/if}

    {#if true}
      {#each $tasksSorted as taskId}
        <li id={taskId["@id"]}>
          <TaskSummary id={taskId["@id"]} />
        </li>
      {/each}
    {/if}
  </ul>
</div>

<style>
  header {
    position: sticky;
    top: 0;
    overflow: hidden;
    background: var(--background-color);
    z-index: 1;
  }

  .tasks {
    max-width: 100%;
    overflow-wrap: break-word;
    padding: 0 0 1.5rem;
  }

  .blocked {
    color: var(--gray);
  }

  .done {
    color: var(--gray);
    text-decoration: line-through;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  li {
    padding: 0.5lh;
    margin: 0.5lh 0;
    list-style: none;
    background: var(--slight-shade);
  }

  label {
    display: block;
    width: 100%;
    cursor: pointer;
  }

  input[type="checkbox"] {
    display: none;
  }
</style>
