import * as jsonld from 'jsonld'
import "core-js/actual/array/group.js"
import PQueue from 'p-queue'

let bookmarks = {}

const updateQueue = new PQueue({concurrency: 4})
const handleUpdate = () => {
  updateQueue.off('add', handleUpdate)
  updateQueue.off('idle', handleUpdate)

  setTimeout(async () => {
    const bookmarkIndices = await Promise.all(
      Object.entries(
        Object.values(bookmarks)
          .group(bookmark => bookmark['@id'][9])
      )
      .map(async group => [group[0], await jsonld.canonize(group[1])])
    )
    .then(groups => Object.fromEntries(groups))

    postMessage({
      indices: {
        bookmarks: bookmarkIndices
      },
      bookmarks: bookmarks
    })

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
      let newGraph = event.data.newValue
      let oldGraph = event.data.oldValue

      if (event.data.newContentType === "application/n-quads") {
        newGraph = await jsonld.fromRDF(newGraph)
      }

      if (event.data.oldContentType === "application/n-quads") {
        oldGraph = await jsonld.fromRDF(oldGraph)
      }

      if (oldGraph) {
        [oldGraph]
          .flat()
          .forEach(item => delete bookmarks[item['@id']])
      }

      if (!newGraph) {
        return;
      }

      delete newGraph['@context']

      return await jsonld
        .frame(
          newGraph,
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
