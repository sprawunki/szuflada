<script lang="ts">
  import { tasks, taskGraphComponents } from "$lib/store";
  import { taskFrame } from "$lib/jsonld/frames";
  import jsonld from "$lib/jsonld/jsonld";
  import { writable } from "svelte/store";
  import { saveTask } from "$lib/remotestorage";

  const taskA = writable({});
  const taskB = writable({});

  let taskAStore;
  let taskBStore;

  $: taskAStore = $taskGraphComponents[0]
    ? tasks($taskGraphComponents[0])
    : writable({});

  $: taskBStore = $taskGraphComponents[1]
    ? tasks($taskGraphComponents[1])
    : writable({});

  $: jsonld.frame($taskAStore, taskFrame).then((task) => taskA.set(task));
  $: jsonld.frame($taskBStore, taskFrame).then((task) => taskB.set(task));

  const addPriorityOver = async (moreImportant, lessImportant) => {
    moreImportant["moreImportantThan"].push(lessImportant["@id"]);

    moreImportant["dc:date"] = new Date().toISOString();
    const result = await jsonld.frame(moreImportant, taskFrame);

    await saveTask(result);
  };
</script>

{#if $taskGraphComponents.length > 1 && $taskA["summary"] && $taskB["summary"]}
  <div class="compare-tasks">
    <h2>Which is <em>more important</em>?</h2>

    <div class="choice">
      <button
        on:click={addPriorityOver($taskA, $taskB)}
        data-task-id={$taskA["@id"]}
      >
        {$taskA["summary"]}
      </button>
      <span>or</span>
      <button
        on:click={addPriorityOver($taskB, $taskA)}
        data-task-id={$taskB["@id"]}
      >
        {$taskB["summary"]}
      </button>
    </div>
  </div>
{/if}

<style>
  .compare-tasks {
    background-color: #077;
    color: #fff;
    margin: 0;
    padding: 0.5lh;
    text-align: center;
  }

  .choice {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .compare-tasks button {
    border: none;
    display: block;
    flex: 1;
    margin: 0.5lh;
    padding: 0.5lh;
    cursor: pointer;
  }
</style>
