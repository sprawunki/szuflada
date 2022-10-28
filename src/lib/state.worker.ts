import * as jsonld from 'jsonld'
import "core-js/actual/array/group.js"

let bookmarks = {}

onmessage = (event) => {
  console.log("worker", event.data.path)

  const graph = event.data.newValue
  const id = graph['@id']

  delete graph['@context']

  jsonld.expand(graph)
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
    .then(() => postMessage(Object.values(bookmarks).map(graph => graph[0])))
    .catch(error => console.error(error, graph))
}

export {}
