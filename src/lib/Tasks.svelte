<script lang="ts">
  import { default as moment } from 'moment'

  import CompareTasks from '$lib/CompareTasks.svelte';
  import Cycles from '$lib/Cycles.svelte';

  import { tasks, taskList, taskProgress } from '$lib/store'
  import { remoteStorage } from '$lib/remotestorage.ts'

  const toggleStatus = (task) => {
    if(task["https://szuflada.app/ns/status"] == "https://szuflada.app/ns/todo") {
        task["https://szuflada.app/ns/status"] = "https://szuflada.app/ns/done"
    } else {
        task["https://szuflada.app/ns/status"] = "https://szuflada.app/ns/todo"
    }

    remoteStorage['szuflada.app/task'].save(task)
  }
</script>

<div class="tasks">
  <div class="progress">
    <div class="progressBar" style={`width: ${$taskProgress*100}%; transition: width ${+!!$taskProgress}s;`}></div>
  </div>

  <h2>Tasks ({$taskList.filter(task => !task.done).length}/{$taskList.length})</h2>
  <CompareTasks />
  <Cycles />
  <ul class='tasklist'>
  {#each $taskList as task}
  <li class="task" id={task["@id"]}>
    <div class="task__title" class:blocked={task.blocked} class:done={task.done}>
        <label>
            <input type="checkbox" on:change={toggleStatus(task)} checked={$tasks[task["@id"]].done} />
            <span>{task['https://szuflada.app/ns/summary']}</span>
            {#if task['https://szuflada.app/ns/deadline']}
                <small>{moment(task['https://szuflada.app/ns/deadline']).fromNow()}</small>
            {/if}
        </label>
    </div>
  </li>
  {/each}
  </ul>
</div>

<style>
  .progressBar {
    background: #0cc;
    height: 0.125rem;
  }

  .progress {
    position: sticky;
    top: 0;
    right: 0;
    left: 0;
    background: #077;
  }

    .tasks {
        max-width: 100%;
        overflow-wrap: break-word;
        padding: 0 0 1.5rem;
    }

    .blocked {
        color: #333;
    }

    .done {
        color: gray;
        text-decoration: line-through;
    }

    ul {
        padding: 0 0.5rem;
        margin: 0;
    }

    li {
        padding: 0.25em 0;
        margin: 0;
        list-style: none;
    }

    label {
        display: block;
        width: 100%;
    }

    input[type=checkbox] {
        display: none;
    }
</style>
