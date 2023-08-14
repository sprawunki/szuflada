<script lang="ts">
    import {v4 as uuidv4} from 'uuid'
    import { remoteStorage } from '$lib/remotestorage.ts'

    let newTaskInput;
    let summary;

    const addTask = (summary) => {
        remoteStorage['szuflada.app/task'].save({
            "@id": uuidv4(),
            "@type": "szuflada.app/Task",
            "http://purl.org/dc/elements/1.1/#created": new Date().toISOString(),
            "http://purl.org/dc/elements/1.1/#date": new Date().toISOString(),
            "https://szuflada.app/ns/summary": summary,
            "https://szuflada.app/ns/before": [],
            "https://szuflada.app/ns/after": [],
        })

        newTaskInput.value = '';
    }

    const onSubmit = (event) => {
        const formData = new FormData(event.target);

        addTask(formData.get("newTask"))
    }
</script>

<div class="new-task">
    <form on:submit|preventDefault={onSubmit}>
        <fieldset>
            <legend>New Note</legend>
            <input id="newTask" name="newTask" bind:this={newTaskInput} bind:value={summary} type="text" placeholder="ToDo app but with topological sort"/>
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
        background: #ccc;
        margin: 0 -0.5rem;
    }
    input[type=text],
    textarea {
        display: block;
        width: 100%;
        appearance: none;
        border: none;
        background: none;
        resize: none;
        font: inherit;
        background: #eee;
        padding: 1rem;
        box-sizing: border-box;
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
    input[type=submit] {
        cursor: pointer;
        appearance: none;
        background: #077;
        color: #fff;
        border: none;
        padding: 0.5rem 1rem;
    }
</style>