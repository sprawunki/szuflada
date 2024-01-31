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
    async () => {
      let graph = event.data.newValue

      if (event.data.newContentType === "application/n-quads") {
        graph = await jsonld.fromRDF(graph)
      }

      delete graph['@context']

      return await jsonld
        .frame(
          graph,
          {
            "@context": {
              "bookmark": "http://www.w3.org/2002/01/bookmark#",
              "dc": "http://purl.org/dc/elements/1.1/#",
              "prov": "http://www.w3.org/ns/prov#",
            },
            "bookmark:recalls": {},
            "bookmark:title": {},
            "dc:created": {},
            "dc:date": {},
            "@explicit": true,
            "@requireAll": true,
          }
        )
        .then(graph => jsonld.expand(graph))
        .then(graph => graph.map(bookmark =>
          jsonld.frame(
            bookmark,
            {
              "@context": {
                "bookmark": "http://www.w3.org/2002/01/bookmark#",
                "dc": "http://purl.org/dc/elements/1.1/#",
                "prov": "http://www.w3.org/ns/prov#",
              },
              "bookmark:recalls": {},
              "bookmark:title": {},
              "dc:created": {},
              "dc:date": {},
              "@explicit": true,
              "@requireAll": true,
            }
          )
        ))
        .then(graph => Promise.all(graph))
        .then(graph => graph.map(bookmark => [bookmark['@id'], bookmark]))
        .then(graph => Object.fromEntries(graph))
        .then(graphs => { bookmarks = {...bookmarks, ...graphs }})
        .catch(error => console.error(error, graph))
    }
  )
}

updateQueue.add(
  () => {}
)

export {}
