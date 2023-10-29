import * as jsonld from 'jsonld'
import "core-js/actual/array/group.js"
import PQueue from 'p-queue'

let bookmarks = {}

const updateQueue = new PQueue({concurrency: 4})
const handleUpdate = () => {
  updateQueue.off('add', handleUpdate)
  updateQueue.off('idle', handleUpdate)

  setTimeout(() => {
    postMessage(Object.values(bookmarks).map(graph => graph[0]))

    if (updateQueue.size === 0 && updateQueue.pending === 0) {
      return updateQueue.on('add', handleUpdate)
    } else {
      return updateQueue.on('idle', handleUpdate)
    }
  }, 100)
}
updateQueue.on('idle', handleUpdate)

onmessage = (event) => {
  updateQueue.add(
    () => {
      const graph = event.data.newValue
      const id = graph['@id']

      delete graph['@context']

      return jsonld.expand(graph)
        .then(graph => jsonld.frame(
          graph,
          {
            "http://www.w3.org/2002/01/bookmark#recalls": {},
            "http://www.w3.org/2002/01/bookmark#title": {},
            "http://purl.org/dc/elements/1.1/#created": {},
            "@explicit": true,
            "@requireAll": true,
          }
        ))
        .then(graph => jsonld.compact(
          graph,
          {
            "@context": {
              "created": "http://purl.org/dc/elements/1.1/#created",
              "title": "http://www.w3.org/2002/01/bookmark#title",
              "recalls": "http://www.w3.org/2002/01/bookmark#recalls"
            }
          }
        ))
        .then(graph => [graph].group(g => g['@id']))
        .then(graphs => { bookmarks = {...bookmarks, ...graphs }})
        .catch(error => console.error(error, graph))
    }
  )
}

export {}
