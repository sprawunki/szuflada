<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import { saveTask } from "$lib/remotestorage.ts";

  let newTaskInput;
  let summary;

  const addTask = (summary) => {
    saveTask({
      "@id": uuidv4(),
      "@type": "szuflada.app/Task",
      "dc:created": new Date().toISOString(),
      "dc:date": new Date().toISOString(),
      summary: summary,
    });

    newTaskInput.value = "";
  };

  const onSubmit = (event) => {
    const formData = new FormData(event.target);

    addTask(formData.get("newTask"));
  };
</script>

<div class="new-task">
  <form on:submit|preventDefault={onSubmit}>
    <fieldset>
      <legend>New Note</legend>
      <input
        id="newTask"
        name="newTask"
        bind:this={newTaskInput}
        bind:value={summary}
        type="text"
        placeholder="ToDo app but with topological sort"
      />
      <input type="submit" value="Add" />
    </fieldset>
  </form>
</div>

<style>
  .new-task {
    position: sticky;
    right: 0;
    bottom: 0;
    left: 0;
    background: var(--background-color);
    margin: 0;
  }
  input[type="text"],
  textarea {
    background: var(--slight-shade);
    color: var(--foreground-color);
    display: block;
    width: 100%;
    appearance: none;
    border: none;
    resize: none;
    font-size: inherit;
    padding: 0.5lh;
    box-sizing: border-box;
  }

  input::placeholder {
    color: var(--gray);
  }

  fieldset {
    border: none;
    display: block;
    padding: 0;
    margin: 0;
    display: flex;
  }
  legend {
    display: none;
  }

  button,
  input[type="submit"] {
    cursor: pointer;
    appearance: none;
    border: none;
    padding: 0.5rem 1rem;
    background: var(--accent-color);
    color: var(--background-color);
  }

  button:hover,
  input[type="submit"]:hover {
    color: var(--background-color);
    background: var(--foreground-color);
  }
</style>
