<script lang="ts">
  import { tasks, taskList, firstUnblockedTask, taskToComparePriorityTo } from '$lib/store'
  import { default as moment } from 'moment'

  import { remoteStorage } from '$lib/remotestorage.ts'

  const setOrder = (first, next) => {
    first["https://szuflada.app/ns/before"].push(
      { "@id": next["@id"] }
    )

    remoteStorage['szuflada.app/task'].save(first)
  }
</script>

{#if $firstUnblockedTask && $taskToComparePriorityTo && $firstUnblockedTask["@id"] != $taskToComparePriorityTo["@id"]}
<div class="compare-tasks">
  <span>Which should come <em>first</em>?</span>
  <ul class="choice">
    <li><a href="#" on:click={setOrder($firstUnblockedTask, $taskToComparePriorityTo)}>{$firstUnblockedTask["https://szuflada.app/ns/summary"]}</a></li>
    <li><a href="#" on:click={setOrder($taskToComparePriorityTo, $firstUnblockedTask)}>{$taskToComparePriorityTo["https://szuflada.app/ns/summary"]}</a></li>
    <!-- <li><a href="#">Doesn't matter</a></li> -->
  </ul>
</div>
{/if}

<style>
  .compare-tasks {
    background-color: #077;
    color: #fff;
    margin: 0;
    padding: 0.5rem;
    text-align: center;
    position: sticky;
    top: 0.5rem;
  }
  .compare-tasks a {
    color: inherit;
  }
  .compare-tasks .choice {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    margin: 0;
    padding: 0;
    text-align: center;
  }
  .compare-tasks .choice li {
    min-width: 40%;
    flex: 1;
    list-style: none;
    display: flex;
    margin: 0.5rem;
    padding: 0 1em;
    box-sizing: border-box;
    position: relative;
    justify-content: center;
    align-items: center;
  }
  .compare-tasks .choice a {
    position: relative;
    flex-grow: 0;
    flex-shrink: 1;
    display: block;
  }
  .compare-tasks .choice li:last-child {
    flex-grow: 1;
    width: 100%;
  }
  .compare-tasks .choice li:nth-child(2n) a::before {
    content: '👉';
    display: block;
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translate(-0.2em, -50%);
  }
  .compare-tasks .choice li:nth-child(2n+1) a::after {
    content: '👈';
    display: block;
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translate(0.2em, -50%);
  }
  /* .compare-tasks .choice li:last-child a::before {
    content: '🤷';
    position: static;
    margin: 0 0.2em 0 0;
  }
  .compare-tasks .choice li:last-child a::after {
    content: '';
  } */
</style>
