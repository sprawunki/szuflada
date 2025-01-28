import jsonld from "jsonld";
import {
  metaContext,
  bookmarkContext,
  taskContext,
} from "$lib/jsonld/contexts";

const nodeDocumentLoader = jsonld.documentLoaders.xhr;

const CONTEXTS = {
  "http://remotestorage.io/spec/modules/szuflada.app/meta": {
    "@context": metaContext,
  },
  "http://remotestorage.io/spec/modules/szuflada.app/Bookmark": {
    "@context": bookmarkContext,
  },
  "http://remotestorage.io/spec/modules/szuflada.app/Graph": {
    "@context": bookmarkContext,
  },
  "http://remotestorage.io/spec/modules/szuflada.app/Task": {
    "@context": taskContext,
  },
  "http://remotestorage.io/spec/modules/szuflada.app/TaskIndex": {
    "@context": taskContext,
  },
};

const customLoader = async (url: string) => {
  if (url in CONTEXTS) {
    return {
      contextUrl: null,
      document: CONTEXTS[url],
      documentUrl: url,
    };
  }

  return nodeDocumentLoader(url);
};

jsonld.documentLoader = customLoader;

export default jsonld;
