import { writable, derived } from 'svelte/store'
import { Graph } from "graph-data-structure";

const isDone = (task) => task["https://szuflada.app/ns/status"] == "https://szuflada.app/ns/done"

export const bookmarks = writable({})

export const bookmarkList = derived(
  bookmarks,
  $bookmarks => [...Object.values($bookmarks)
    .sort((a: any, b: any) => b["created"]
      .localeCompare(
        a["created"]
      )
    )
  ]
)

export const tasks = writable({})

export const taskList = derived(
  tasks,
  $tasks => {
    const graph = new Graph();

    Object.values($tasks).forEach(task => {
      graph.addNode(task['@id']);

      task['https://szuflada.app/ns/before'].forEach(before => {
        graph.addEdge(task['@id'], before['@id']);
      });

      task['https://szuflada.app/ns/after'].forEach(after => {
        graph.addEdge(after['@id'], task['@id']);
      });
    });

    const order = graph.topologicalSort();

    const { links, nodes } = graph.serialize()

    return Object.values($tasks)
      .map(task => {
        task.done = task['https://szuflada.app/ns/status'] == 'https://szuflada.app/ns/done';
        task.blocked = links.some(link => task['@id'] == link.target && !isDone($tasks[link.source]));
        return task
      })
      .sort((a, b) => order.indexOf(a['@id']) - order.indexOf(b['@id']))
      .sort((a, b) => Math.sign(a.blocked - b.blocked))
      .sort((a, b) => Math.sign(a.done - b.done))
  }
)

export const firstUnblockedTask = derived(
  taskList,
  $taskList => [...$taskList].find(task => !isDone(task) && !task.blocked)
)

export const taskToComparePriorityTo = derived(
  taskList,
  $taskList => {
    const toDo = [...$taskList].filter(task => !isDone(task) && !task.blocked)

    return toDo[parseInt(toDo.length / 2)]
  }
)