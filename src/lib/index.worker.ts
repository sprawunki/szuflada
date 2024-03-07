import { MemoryLevel } from "memory-level";
import { DataFactory } from 'rdf-data-factory';
import { Quadstore } from 'quadstore';
import { Engine } from 'quadstore-comunica';
import jsonld from "jsonld";
import PQueue from 'p-queue';

const backend = new MemoryLevel();
const df = new DataFactory();
const store = new Quadstore({backend, dataFactory: df});
const engine = new Engine(store);
const quadQueue = new PQueue({
  concurrency: 1,
});

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

const productFrame =
{
  "@context": {
    "schema:offers": {
      "@container": "@set",
    },
    "https://schema.org/url": {
      "@id": "schema:url",
      "@type": "xsd:string",
    },
    "schema": "https://schema.org/",
    "bookmark": "http://www.w3.org/2002/01/bookmark#",
    "dc": "http://purl.org/dc/elements/1.1/#",
    "prov": "http://www.w3.org/ns/prov#",
  },
  "@type": ["schema:Product"],
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
    "@requireAll": true,
    "@explicit": true,
    "@omitDefault": true,
  },
  "@explicit": true,
  "@omitDefault": true,
  "@preserveArrays": true,
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

const productQuery = `
PREFIX schema: <https://schema.org/>

CONSTRUCT {
  ?product a schema:Product ;
    schema:gtin13     ?gtin13 ;
    schema:gtin14     ?gtin14 ;
    schema:identifier ?gtin14 ;
    schema:name       ?productName ;
    schema:offers [
      a schema:Offer ;
      schema:url ?url ;
      schema:price ?priceStr ;
      schema:priceCurrency ?currency ;
      schema:availability ?availability
    ] .
} WHERE {
  SELECT DISTINCT ?product ?gtin14 ?gtin13 (SAMPLE(?name) AS ?productName) ?url ?priceStr ?currency ?availability WHERE {
    {
      SELECT ?product ?gtin14 ?gtin13 (SAMPLE(?productName) AS ?name) ?price ?currency ?availability ?offerUrl WHERE {
        GRAPH ?g {
          ?gtin ^(schema:gtin|schema:gtin12|schema:gtin13|schema:gtin14|schema:isbn) ?productOffered .

          ?productOffered schema:name ?productName .

          ?offer ^schema:offers ?productOffered;
            schema:price ?productPrice ;
            schema:priceCurrency ?currency ;
            schema:availability ?availability ;
            schema:url ?offerUrl .

          BIND(xsd:integer(REPLACE(?gtin, "-", "")) AS ?identifier)
          FILTER(datatype(?identifier) = xsd:integer)
          BIND(CONCAT("00000000000000", STR(?identifier)) AS ?identifierPadded)
          BIND(SUBSTR(?identifierPadded, STRLEN(?identifierPadded) - 12) AS ?gtin13)
          BIND(SUBSTR(?identifierPadded, STRLEN(?identifierPadded) - 13) AS ?gtin14)
        }
      } GROUP BY (IRI(CONCAT("urn:gtin:", STR(?gtin14))) AS ?product) ?gtin14 ?gtin13 (STR(xsd:decimal(?productPrice)) AS ?price) ?currency ?availability ?offerUrl
    }
  } GROUP BY ?product ?gtin14 ?gtin13 ?offer (STR(?price) AS ?priceStr) ?currency ?availability (STR(?offerUrl) AS ?url)
} ORDER BY ?gtin14 ?url
`

const refreshState = async () => {
  return await store.open()
    .then(() => engine.query(productQuery))
    .then((query: any) => query.execute())
    .then((stream: any) => stream.toArray())
    .then((quads: any) => jsonld.fromRDF(quads))
    .then((graph: any) => jsonld.frame(graph, productFrame))
    .then((graph: any) => postMessage({result: graph}))
    .then(() => store.close())
    .catch(error => console.error("INDEX WORKER ERROR", error))
}

const handleUpdate = () => {
  quadQueue.off('add', handleUpdate)
  quadQueue.off('idle', handleUpdate)

  quadQueue.add(async () => {
    await refreshState()

    if (quadQueue.size > 0) {
      console.info("INDEX_Q", "refresh on idle")
      return quadQueue.on('idle', handleUpdate)
    }

    console.info("INDEX_Q", "refresh on add")
    return quadQueue.on('add', handleUpdate)
  })
}

handleUpdate()

const frameProducts = (nquads: string) => jsonld
  .fromRDF(nquads, { format: "application/n-quads" })

const addQuads = async (data: string, scopeId: string) => {
  await frameProducts(data)
    .then(async product => {
      return await store.open()
        .then(() => jsonld.toRDF(product, {}))
        .then(async (quads: any) => {
          const scope = await getScope(scopeId ?? '_')

          return store.multiPut(quads, { scope })
        })
        .then(() => store.close())
        .catch((error: any) => console.error(error, data))
    })
}

const delQuads = async (data: string, scopeId: string) => {
  await frameProducts(data)
    .then(async product => {
      return await store.open()
        .then(() => jsonld.toRDF(product, {}))
        .then(async (quads: any) => {
          const scope = await getScope(scopeId ?? '_')

          return store.multiDel(quads, { scope })
        })
        .then(() => store.close())
        .catch((error: any) => console.error(error, data))
    })
}

onmessage = (message) => {
  quadQueue.add(async () => {
    if (message.data.oldValue) {
      await delQuads(message.data.oldValue, message.data.path)
    }

    if (message.data.newValue) {
      await addQuads(message.data.newValue, message.data.path)
    }

    return;
  })
}

export {}
