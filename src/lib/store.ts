import { default as moment } from 'moment'
import { writable, derived } from 'svelte/store'
import graphlib from '@dagrejs/graphlib'
const { Graph, alg } = graphlib
import { v5 as uuidv5 } from 'uuid'

const initTimestamp = +new Date();

const NS_BOOKMARK = uuidv5("https://szuflada.app/bookmark/", uuidv5.URL);

const isDone = (task) => task["https://szuflada.app/ns/status"] == "https://szuflada.app/ns/done"

export const bookmarks = writable({})

export const bookmarkProgress = derived(
  bookmarks,
  $bookmarks => Object.values($bookmarks).filter(bookmark => bookmark['@id']).length / Object.values($bookmarks).length 
)

export const bookmarkList = derived(
  bookmarks,
  $bookmarks => Object.values($bookmarks)
    .sort((a: any, b: any) => a.hasOwnProperty('http://purl.org/dc/elements/1.1/#created') && b.hasOwnProperty('http://purl.org/dc/elements/1.1/#created')
        ? b["http://purl.org/dc/elements/1.1/#created"] 
          .localeCompare(
            a["http://purl.org/dc/elements/1.1/#created"]
          )
        : b.hasOwnProperty('http://purl.org/dc/elements/1.1/#created') - a.hasOwnProperty('http://purl.org/dc/elements/1.1/#created')
    )
)

export const products = writable({})

export const productProgress = writable(0)

export const productList = derived(
  products,
  $products => Object
    .values($products)
    .filter(product => product['@id'])
    .sort((a, b) => a['@id'].localeCompare(b['@id']))
)

export const tasks = writable({})

export const taskProgress = derived(
  tasks,
  $tasks => Object.values($tasks).filter(task => task['@id']).length / Object.values($tasks).length 
)

export const taskList = derived(
  tasks,
  $tasks => {
    const tasks = Object.values($tasks)
      .filter(task => task['@id'])
    
    const graph = new Graph();

    tasks.forEach(task => {
      graph.setNode(task['@id']);
    })


    tasks.forEach(task => {
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

    const deadlineOrder = tasks
      .sort((a, b) => importanceOrder.indexOf(a['@id']) - importanceOrder.indexOf(b['@id']))
      .sort((a, b) => {
        const deadlineA = a['https://szuflada.app/ns/deadline'] ? new Date(a['https://szuflada.app/ns/deadline']) : Infinity
        const deadlineB = b['https://szuflada.app/ns/deadline'] ? new Date(b['https://szuflada.app/ns/deadline']) : Infinity


        return deadlineA - deadlineB
      })
      .map(item => item['@id'])
    const scheduledOrder = tasks
      .sort((a, b) => importanceOrder.indexOf(a['@id']) - importanceOrder.indexOf(b['@id']))
      .sort((a, b) => {
        const scheduledA = a['https://szuflada.app/ns/scheduled'] ? new Date(a['https://szuflada.app/ns/scheduled']) : now
        const scheduledB = b['https://szuflada.app/ns/scheduled'] ? new Date(b['https://szuflada.app/ns/scheduled']) : now


        return scheduledA - scheduledB
      })
      .map(item => item['@id'])

    const links = graph.edges()

    const defaultDeadline = moment().add(10, 'days')

    return tasks
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
    const tasks = Object.values($tasks)
      .filter(task => task['@id'])
      
    const graph = new Graph();

    tasks.forEach(task => {
      graph.setNode(task['@id']);
    });


    tasks.forEach(task => {
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

    return tasks
      .filter(task => cycle.includes(task['@id']))
  }
)
