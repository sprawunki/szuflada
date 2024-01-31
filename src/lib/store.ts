import { default as moment } from 'moment'
import { writable, derived } from 'svelte/store'
import graphlib from '@dagrejs/graphlib'
const { Graph, alg } = graphlib

const isDone = (task) => task["https://szuflada.app/ns/status"] == "https://szuflada.app/ns/done"

export const bookmarks = writable({})

export const bookmarkList = derived(
  bookmarks,
  $bookmarks => [...Object.values($bookmarks)
    .sort((a: any, b: any) => b["dc:created"]
      .localeCompare(
        a["dc:created"]
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
      graph.setNode(task['@id']);
    });


    Object.values($tasks).forEach(task => {
      task['https://szuflada.app/ns/before'].forEach(before => {
        graph.setEdge(task['@id'], before['@id']);
      });

      task['https://szuflada.app/ns/after'].forEach(after => {
        graph.setEdge(after['@id'], task['@id']);
      });
    });

    const now = new Date();

    if (!alg.isAcyclic(graph)) {
      return [];
    }

    const importanceOrder = alg.topsort(graph);

    const deadlineOrder = Object.values($tasks)
      .sort((a, b) => importanceOrder.indexOf(a['@id']) - importanceOrder.indexOf(b['@id']))
      .sort((a, b) => {
        const deadlineA = a['https://szuflada.app/ns/deadline'] ? new Date(a['https://szuflada.app/ns/deadline']) : Infinity
        const deadlineB = b['https://szuflada.app/ns/deadline'] ? new Date(b['https://szuflada.app/ns/deadline']) : Infinity


        return deadlineA - deadlineB
      })
      .map(item => item['@id'])
    const scheduledOrder = Object.values($tasks)
      .sort((a, b) => importanceOrder.indexOf(a['@id']) - importanceOrder.indexOf(b['@id']))
      .sort((a, b) => {
        const scheduledA = a['https://szuflada.app/ns/scheduled'] ? new Date(a['https://szuflada.app/ns/scheduled']) : now
        const scheduledB = b['https://szuflada.app/ns/scheduled'] ? new Date(b['https://szuflada.app/ns/scheduled']) : now


        return scheduledA - scheduledB
      })
      .map(item => item['@id'])

    const links = graph.edges()

    const defaultDeadline = moment().add(10, 'days')

    return Object.values($tasks)
      .map(task => {
        task.done = task['https://szuflada.app/ns/status'] == 'https://szuflada.app/ns/done';
        task.blocked = links.some(link => task['@id'] == link.w && !isDone($tasks[link.v]));

        return task
      })
      .sort((a, b) => {
        const importanceA = importanceOrder.indexOf(a['@id'])
        const importanceB = importanceOrder.indexOf(b['@id'])

        const scheduledA = scheduledOrder.indexOf(a['@id'])
        const scheduledB = scheduledOrder.indexOf(b['@id'])

        const deadlineA = deadlineOrder.indexOf(a['@id'])
        const deadlineB = deadlineOrder.indexOf(b['@id'])

        const weightA = Math.sqrt((scheduledA * scheduledA) + (deadlineA * deadlineA) + (importanceA * importanceA))
        const weightB = Math.sqrt((scheduledB * scheduledB) + (deadlineB * deadlineB) + (importanceB * importanceB))

        return weightA - weightB
      })
      .sort((a, b) => a.done - b.done)
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

export const cycles = derived(
  tasks,
  $tasks => {
    const graph = new Graph();

    Object.values($tasks).forEach(task => {
      graph.setNode(task['@id']);
    });


    Object.values($tasks).forEach(task => {
      task['https://szuflada.app/ns/before'].forEach(before => {
        graph.setEdge(task['@id'], before['@id']);
      });

      task['https://szuflada.app/ns/after'].forEach(after => {
        graph.setEdge(after['@id'], task['@id']);
      });
    });

    if (alg.isAcyclic(graph)) {
      return []
    }

    const cycle = alg.findCycles(graph)[0];

    return Object.values($tasks)
      .filter(task => cycle.includes(task['@id']))
  }
)
