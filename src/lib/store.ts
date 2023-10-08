import { default as moment } from 'moment'
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

    const defaultDeadline = moment().add(10, 'days')

    return Object.values($tasks)
      .map(task => {
        task.done = task['https://szuflada.app/ns/status'] == 'https://szuflada.app/ns/done';
        task.blocked = links.some(link => task['@id'] == link.target && !isDone($tasks[link.source]));

        return task
      })
      .sort((a, b) => {
        const deadlineA = a['https://szuflada.app/ns/deadline'] ? moment(a['https://szuflada.app/ns/deadline']) : defaultDeadline;
        const deadlineB = b['https://szuflada.app/ns/deadline'] ? moment(b['https://szuflada.app/ns/deadline']) : defaultDeadline;

        const urgencyA = Math.max(0, deadlineA.diff(moment(), 'days'))
        const urgencyB = Math.max(0, deadlineB.diff(moment(), 'days'))

        const importanceA = order.indexOf(a['@id'])
        const importanceB = order.indexOf(b['@id'])

        const weightA = Math.sqrt((urgencyA * urgencyA) + (importanceA * importanceA))
        const weightB = Math.sqrt((urgencyB * urgencyB) + (importanceB * importanceB))

        return weightA - weightB
      })
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