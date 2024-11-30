<script lang="ts">
  import { default as moment } from "moment";

  import CompareTasks from "$lib/CompareTasks.svelte";
  import Cycles from "$lib/Cycles.svelte";
  import Progress from "$lib/Progress.svelte";

  import { tasks, taskList, taskProgress } from "$lib/store";
  import { remoteStorage } from "$lib/remotestorage.ts";

  const toggleStatus = (task) => {
    if (
      task["https://szuflada.app/ns/status"] ==
        "https://szuflada.app/ns/todo" ||
      !task["https://szuflada.app/ns/status"]
    ) {
      task["https://szuflada.app/ns/status"] = "https://szuflada.app/ns/done";
    } else {
      task["https://szuflada.app/ns/status"] = "https://szuflada.app/ns/todo";
    }

    remoteStorage["szuflada.app/task"].save(task);
  };
</script>

<div class="tasks">
  <header>
    <h1>
      Tasks ({$taskList.filter((task) => !task.done).length}/{$taskList.length})
    </h1>

    <Progress progress={$taskProgress} />
  </header>

  <CompareTasks />
  <Cycles />
  <ul class="tasklist">
    {#each $taskList as task}
      <li class="task" id={task["@id"]} class:done={task.done}>
        <div class="task__title" class:blocked={task.blocked}>
          <label>
            <input
              type="checkbox"
              on:change={toggleStatus(task)}
              checked={$tasks[task["@id"]].done}
            />
            <span>{task["https://szuflada.app/ns/summary"]}</span>
            {#if task["https://szuflada.app/ns/deadline"]}
              <small
                >{moment(
                  task["https://szuflada.app/ns/deadline"],
                ).fromNow()}</small
              >
            {/if}
          </label>
        </div>
      </li>
    {/each}
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
    padding: 0 0.5rem;
    margin: 0;
  }

  li {
    padding: 0.5lh 0;
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
