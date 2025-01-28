<script lang="ts">
  import { writable } from "svelte/store";
  import { tasks } from "$lib/store";
  import jsonld from "$lib/jsonld/jsonld";
  import { taskFrame } from "$lib/jsonld/frames";

  export let id;
  const task = writable({});

  let taskStore;

  $: taskStore = tasks(id);

  $: jsonld.frame($taskStore, taskFrame).then((graph) => task.set(graph));
</script>

<span data-task-id={id}>
  {$task["summary"]}
</span>
