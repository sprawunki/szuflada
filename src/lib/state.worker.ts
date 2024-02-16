import * as jsonld from 'jsonld'
import "core-js/actual/array/group.js"
import PQueue from 'p-queue'

let bookmarks = {}
let oldBookmarkIndices = ''

const bookmarkFrame =
{
  "@context": {
    "schema:image": {
      "@type": "xsd:string",
      "@container": "@set",
    },
    "schema:offers": {
      "@container": "@set",
    },
    "schema": "https://schema.org/",
    "bookmark": "http://www.w3.org/2002/01/bookmark#",
    "dc": "http://purl.org/dc/elements/1.1/#",
    "prov": "http://www.w3.org/ns/prov#",
  },
  "bookmark:recalls": {
    "@id": {},
    "@type": {},
    "prov:generatedAtTime": {},
    "@graph": {
      "@type": ["schema:Book", "schema:Product"],
      "schema:name": {},
      "schema:image": {
        "@type": "xsd:string",
        "@embed": "@never",
      },
      "schema:brand": {},
      "schema:mpn": {},
      "schema:gtin": {},
      "schema:gtin8": {},
      "schema:gtin12": {},
      "schema:gtin13": {},
      "schema:gtin14": {},
      "schema:isbn": {},
      "schema:identifier": {},
      "schema:offers": {
        "@type": "schema:Offer",
        "schema:url": {
          "@embed": "@never",
        },
        "schema:price": {},
        "schema:priceCurrency": {},
        "@requireAll": true,
        "@explicit": false,
      },
      "@explicit": true,
      "@requireAll": false,
      "@omitDefault": true,
    },
    "@explicit": true,
    "@embed": "@always",
    "@requireAll": false,
    "@omitDefault": false,
  },
  "bookmark:title": {},
  "dc:created": {},
  "dc:date": {},
  "@explicit": true,
  "@omitDefault": true,
}

const bookmarkFrameMinimal = {
  "@context": {
    "bookmark": "http://www.w3.org/2002/01/bookmark#",
    "dc": "http://purl.org/dc/elements/1.1/#",
    "og": "https://ogp.me/ns#",
    "prov": "http://www.w3.org/ns/prov#",
  },
  "bookmark:recalls": {},
  "bookmark:title": {},
  "dc:created": {},
  "dc:date": {},
  "@embed": "@never",
  "@explicit": true,
  "@omitDefault": true,
}

const updateQueue = new PQueue({concurrency: 8})

updateQueue.on(
  "next",
  () => {
    console.info("Q_SIZE_STATE", updateQueue.size, updateQueue.pending)
  }
)

const handleUpdate = () => {
  updateQueue.off('add', handleUpdate)
  updateQueue.off('idle', handleUpdate)

  setTimeout(async () => {
    const bookmarkIndices = Object.values(bookmarks).group(bookmark => bookmark['@id'][9])

    for (const indexId in bookmarkIndices) {
      try {
        bookmarkIndices[indexId] = await Promise
          .all(
            bookmarkIndices[indexId]
              .map(async index => {
                try {
                  return await jsonld.canonize(index)
                } catch (error) {
                  console.error("Canonization error: skipping item", index, error)
                  return ''
                }
              })
          )
          .then(items => items.join('\n'))
      } catch (error) {
        console.error("Couldn't create index", indexId, bookmarkIndices[indexId])
        bookmarkIndices[indexId] = ''
      }
    }

    const newBookmarkIndices = Object.values(bookmarkIndices).join('\n')
    if (newBookmarkIndices == oldBookmarkIndices) {
      return;
    }

    oldBookmarkIndices = newBookmarkIndices

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

const frameBookmark = (graph: any) => jsonld
  .frame(graph, bookmarkFrame)
  .then(async (graph: any) => {
    await jsonld
      .canonize(graph)
      .catch(error => {
        console.error("Canonization error: falling back to minimal bookmark frame", error, graph)
        graph = jsonld.frame(graph, bookmarkFrameMinimal).then(graph => { console.warn(graph); return graph })
      })

    return graph
  })

onmessage = (event) => {
  updateQueue.add(
    async () => {
      let newGraph = event.data.newValue
      let oldGraph = event.data.oldValue

      if (event.data.newValue === event.data.oldValue) {
        console.debug("STATE WORKER", "Nothing changed - nothing to update.")
        return;
      }

      if (event.data.newContentType === "application/n-quads") {
        newGraph = await jsonld.fromRDF(newGraph)
      }

      if (event.data.oldContentType === "application/n-quads") {
        oldGraph = await jsonld.fromRDF(oldGraph)
      }

      if (!newGraph) {
        return;
      }

      if (oldGraph) {
        const oldBookmarks = await jsonld.frame(oldGraph, { "@type": "http://www.w3.org/2002/01/bookmark#Bookmark" })

        if (oldBookmarks['@graph']) {
          oldBookmarks['@graph'].forEach(bookmark => delete bookmarks[bookmark['@id']])
        }
      }

      delete newGraph['@context']

      const graphs = await jsonld
        .compact(newGraph, { "@context": { "schema": "http://schema.org/" } })
        .then((graph: any) => { graph['@context'] = { "@context": { "schema": "https://schema.org/" } }; return graph })
        .then((graph: any) => frameBookmark(graph))
        .then((graph: any) => jsonld.expand(graph))
        .then((graph: any) => graph.map(
          (bookmark: any) => jsonld.frame(bookmark, bookmarkFrame)
        ))
        .then((graph: any) => Promise.all(graph))
        .then((graph: any) => graph.map(
          (bookmark: any) => [bookmark['@id'], bookmark]
        ))
        .then((graph: any) => Object.fromEntries(graph))
        .catch(error => console.error("STATE WORKER", error, event.data))

      bookmarks = { ...bookmarks, ...graphs }

      return bookmarks;
    }
  )
}

export {}
