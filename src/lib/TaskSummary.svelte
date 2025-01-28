<script lang="ts">
  import { writable } from "svelte/store";
  import { tasks } from "$lib/store";
  import jsonld from "$lib/jsonld/jsonld";
  import { taskFrame } from "$lib/jsonld/frames";
  import moment from "moment";
  import { saveTask, removeTask } from "$lib/remotestorage";
  import TaskTitle from "$lib/TaskTitle.svelte";

  export let id;

  const task = writable({});

  let taskStore;

  $: taskStore = tasks(id);

  $: jsonld.frame($taskStore, taskFrame).then((graph) => task.set(graph));

  const removeDependency = (task, dependency) => {
    task.moreImportantThan = task.moreImportantThan.filter(
      (subtask) => subtask !== dependency,
    );

    saveTask(task);
  };
</script>

<div>
  <div class="meta">
    <small
      ><strong>
        {#if $task["deadline"]}
          Due {moment($task["deadline"]).fromNow()}
        {/if}
      </strong>
    </small>
    <small>
      {#if $task["scheduled"]}
        Scheduled {moment($task["scheduled"]).fromNow()}
      {/if}
    </small>
  </div>

  <details>
    <summary
      class:loading={!$task["summary"]}
      class:done={!!["#Done", "#done"].includes($task["status"])}
      class="task"
    >
      {$task["summary"]}
    </summary>

    <div class="details">
      <div class:loading={!$task["summary"]}>
        Created {moment($task["dc:created"]).fromNow()}
      </div>
      <div class:loading={!$task["summary"]}>
        Updated {moment($task["dc:date"]).fromNow()}
      </div>
    </div>

    {#if $task["status"]}
      <div class="actions">
        {#if $task.status !== "#Done"}
          <button
            on:click={(() => {
              $task.status = "#Done";
              jsonld.frame($task, taskFrame).then((task) => saveTask(task));
            })()}
          >
            Mark as done
          </button>
        {:else}
          <button
            on:click={(() => {
              $task.status = "#ToDo";
              jsonld.frame($task, taskFrame).then((task) => saveTask(task));
            })()}
          >
            Unmark as done
          </button>

          <button
            on:click={() => {
              removeTask(id);
            }}
          >
            Forget
          </button>
        {/if}
      </div>
    {/if}

    {#if $task["moreImportantThan"] && $task["moreImportantThan"].length}
      <details>
        <summary>Precedes ({$task["moreImportantThan"].length})</summary>
        <ul>
          {#each $task["moreImportantThan"] as dependent}
            <li>
              <TaskTitle id={dependent} />
              <button on:click={removeDependency($task, dependent)}
                >Remove</button
              >
            </li>
          {/each}
        </ul>
      </details>
    {/if}
  </details>
</div>

<style>
  .loading {
    background: linear-gradient(
      to right,
      var(--delicate-gray),
      rgba(255, 255, 255, 0) 65%
    );
    color: transparent;
  }

  summary {
    cursor: pointer;
  }

  .details {
    padding: 0.5lh 0;
    font-size: 0.5lh;
    line-height: 1lh;
  }

  .actions {
    padding: 0.5lh 0;
  }

  .actions button {
    background: transparent;
    color: var(--accent-color);
    appearance: none;
    border: none;
    cursor: pointer;
  }

  .done {
    text-decoration: line-through;
  }

  .meta {
    display: flex;
    justify-content: space-between;
  }
</style>
