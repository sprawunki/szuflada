import { MemoryLevel } from "memory-level";
import { DataFactory } from 'rdf-data-factory';
import { Quadstore } from 'quadstore';
import { Engine } from 'quadstore-comunica';

import jsonld from "jsonld";
import { bookmarkContext } from '$lib/jsonld/contexts'

import PQueue from 'p-queue';

const CONTEXTS = {
  "http://remotestorage.io/spec/modules/szuflada.app/Bookmark": {
    "@context": bookmarkContext
  }
}

const nodeDocumentLoader = jsonld.documentLoaders.xhr()

const customLoader = async (url, options) => {
  if(url in CONTEXTS) {
    return {
      contextUrl: null,
      document: CONTEXTS[url],
      documentUrl: url
    };
  }
  return nodeDocumentLoader(url);
}

jsonld.documentLoader = customLoader

const backend = new MemoryLevel();
const df = new DataFactory();
const store = new Quadstore({backend, dataFactory: df});
const engine = new Engine(store);

const quadQueue = new PQueue({
  concurrency: navigator.hardwareConcurrency ?? 1,
});
quadQueue.add(() => store.open())

let maxQueueLength = 0;

quadQueue.on(
  "next",
  () => {
    let progress = 1;

    const queueLength = quadQueue.size + quadQueue.pending
    maxQueueLength = Math.max(queueLength, maxQueueLength)

    if (queueLength && maxQueueLength) {
      progress = 1 - (queueLength / maxQueueLength)
    } else {
      maxQueueLength = 0
    }

    postMessage({progress: progress})
  }
)

const bookmarkFrame = {
  "@context": {
    "bookmark": "http://www.w3.org/2002/01/bookmark#",
    "dc": "http://purl.org/dc/elements/1.1/#",
    "prov": "http://www.w3.org/ns/prov#",
    "szuflada": "https://szuflada.app/ns/",
    "https://szuflada.app/ns/hasBookmark": {
        "@container": "@set",
    },
  },
  "@id": "szuflada:me",
  "szuflada:hasBookmark": {
    "@id": {},
    "@type": "bookmark:Bookmark",
    "bookmark:recalls": {},
    "bookmark:title": {},
    "dc:created": {},
    "dc:date": {},
    "@explicit": false,
    "@omitDefault": false,
    "@requireAll": false,
  },
  "@embed": "@always",
}


const bookmarkFrameFull =
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
      "@type": ["schema:Product"],
      "schema:name": {},
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
        "schema:availability": {},
        "@explicit": true,
        "@omitDefault": true,
        "@requireAll": true,
      },
      "@explicit": true,
      "@omitDefault": true,
      "@requireAll": false,
    },
    "@embed": "@always",
    "@explicit": true,
    "@omitDefault": true,
    "@requireAll": false,
  },
  "bookmark:title": {},
  "dc:created": {},
  "dc:date": {},
  "@explicit": true,
  "@omitDefault": true,
  "@omitGraph": false,
  "@requireAll": true,
}

const productFrame =
{
  "@context": {
    "schema:demands": {
      "@container": "@set",
    },
    "schema:offers": {
      "@container": "@set",
    },
    "schema:url": {
      "@context": {
        "@vocab": "https://schema.org/",
        "schema": "https://schema.org/",
      }
    },
    "dc:source": {
      "@type": "@id",
      "@container": "@set",
    },
    "schema": "https://schema.org/",
    "szuflada": "https://szuflada.app/ns/",
    "bookmark": "http://www.w3.org/2002/01/bookmark#",
    "dc": "http://purl.org/dc/elements/1.1/#",
    "prov": "http://www.w3.org/ns/prov#",
    "@corece": {
      "@iri": [
        "schema:availability",
        "schema:url",
      ],
    },
  },
  "@id": "szuflada:me",
  "schema:demands": {
    "@type": ["schema:Product"],
    "dc:source": {},
    "schema:name": {},
    "schema:brand": {},
    "schema:mpn": {},
    "schema:gtin": {},
    "schema:gtin12": {},
    "schema:gtin13": {},
    "schema:gtin14": {},
    "schema:isbn": {},
    "schema:offers": {
      "@type": "schema:Offer",
      "schema:url": {},
      "schema:price": {},
      "schema:priceCurrency": {},
      "schema:availability": {},
      "@explicit": true,
      "@omitDefault": true,
      "@requireAll": false,
    },
    "@explicit": true,
    "@omitDefault": true,
    "@omitGraph": false,
    "@preserveArrays": true,
    "@requireAll": false,
  },
  "@embed": "@always",
}

const scopes = new Map();
const getScope = async (id) => {
  if (!id) {
    return;
  }

  if (!scopes.has(id)) {
    scopes.set(id, await store.initScope());
  }

  return scopes.get(id);
}

const debugQuery = `
CONSTRUCT { ?g { ?s ?p ?o } } WHERE { GRAPH ?g { ?s ?p ?o } }
`

const productQuery = `
PREFIX dc: <http://purl.org/dc/elements/1.1/#>
PREFIX schema: <https://schema.org/>
PREFIX : <https://szuflada.app/ns/>

CONSTRUCT {
  :me schema:demands ?product .
  
  ?product a schema:Product ;
    schema:brand      ?brandName ;
    schema:gtin13     ?gtin13 ;
    schema:gtin14     ?gtin14 ;
    schema:identifier ?gtin14 ;
    schema:name       ?productName ;
    schema:offers [
      a schema:Offer ;
      schema:url ?url ;
      schema:price ?price ;
      schema:priceCurrency ?currency ;
      schema:availability ?availability
    ] ;
    dc:source ?graph .
} WHERE {
    GRAPH ?graph {
      ?gtin ^(schema:gtin|schema:gtin12|schema:gtin13|schema:gtin14|schema:isbn) ?productOffered .

      ?productOffered schema:name  ?productName .

      ?offer
        a                    schema:Offer ;
        ^schema:offers       ?productOffered ;
        schema:price         ?productPrice ;
        schema:priceCurrency ?currency ;
        schema:url           ?offerUrl .

      OPTIONAL {
        ?brandName ^schema:brand ?productOffered .
      }

      OPTIONAL {
        ?brandName ^(schema:brand/schema:name) ?productOffered .
      }

      OPTIONAL {
        ?productAvailability ^schema:availability ?offer .
      }

      BIND(xsd:integer(REPLACE(?gtin, "-", "")) AS ?identifier)
      FILTER(datatype(?identifier) = xsd:integer)
      BIND(STR(?productAvailability) AS ?availability)
      BIND(STR(?offerUrl) AS ?url)
      BIND(STR(?productPrice) AS ?price)
      BIND(CONCAT("00000000000000", STR(?identifier)) AS ?identifierPadded)
      BIND(SUBSTR(?identifierPadded, STRLEN(?identifierPadded) - 12) AS ?gtin13)
      BIND(SUBSTR(?identifierPadded, STRLEN(?identifierPadded) - 13) AS ?gtin14)
      BIND(IRI(CONCAT("urn:gtin:", STR(?gtin14))) AS ?product)
    }
} ORDER BY ?gtin14
`

const refreshState = () =>
  engine.query(productQuery)
    .then((query: any) => query.execute())
    .then((stream: any) => stream.toArray())
    .then((quads: any) => jsonld.fromRDF(quads))
    .then((graph: any) => jsonld.frame(graph, productFrame))
    .then((graph: any) => postMessage({products: graph}))
    .catch(error => console.error("INDEX WORKER ERROR", error))

const handleUpdate = async () => {
  console.debug('HANDLE UPDATE')
  quadQueue.off('add', handleUpdate)
  quadQueue.off('idle', handleUpdate)

  quadQueue.pause()
  await refreshState()
  quadQueue.start()

  if (quadQueue.size > 0) {
    console.info("INDEX_Q", "refresh on idle")
    return quadQueue.on('idle', handleUpdate)
  }

  console.info("INDEX_Q", "refresh on add")
  return quadQueue.on('add', handleUpdate)
}

handleUpdate()

const frameProducts = (nquads: string) => jsonld
  .expand(nquads)

const addQuads = async (graph: string, scopeId: string) => {
    graph['@context'] = bookmarkFrame['@context']

    return await jsonld.toRDF(graph, {})
        .then(async (quads: any) => {
            const scope = await getScope(scopeId ?? '_')
            return await store.multiPut(quads, { scope })
        })
        .catch((error: any) => console.error(error, data))
}

const delQuads = async (graph: string, scopeId: string) => {
    graph['@context'] = bookmarkFrame['@context']

    return await jsonld.toRDF(graph, {})
        .then(async (quads: any) => {
            const scope = await getScope(scopeId ?? '_')
            return await store.multiDel(quads, { scope })
        })
        .catch((error: any) => console.error(error, data))
}

onmessage = (message) => {
  quadQueue.add(async () => {
    const scope = await getScope(new URL(message.data.path, self.location).toString() ?? '_')

    if (message.data.oldValue) {        
        message.data.oldValue = JSON.parse(
            JSON.stringify(message.data.oldValue)
              .replaceAll('http://schema.org/', 'https://schema.org/')
        )
    }

    if (message.data.newValue) {
        message.data.newValue = JSON.parse(
            JSON.stringify(message.data.newValue)
              .replaceAll('http://schema.org/', 'https://schema.org/')
        )
    }

    await store.multiPatch(
        await jsonld.frame(message.data.oldValue, bookmarkFrameFull)
            .then(graph => jsonld.toRDF(graph)),
        await jsonld.frame(message.data.newValue, bookmarkFrameFull)
            .then(graph => jsonld.toRDF(graph)),
        { scope }
    )

    return;
  })
}

export {}
