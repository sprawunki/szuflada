export const defaultContext = {
  "@base": "http://szuflada.app/ns#",
  "@vocab": "http://szuflada.app/ns#",
  xsd: "http://www.w3.org/2001/XMLSchema#",
  dc: "http://purl.org/dc/elements/1.1/#",
  bookmark: "http://www.w3.org/2002/01/bookmark#",

  lessImportantThan: {
    "@type": "@id",
    "@container": "@set",
  },
  moreImportantThan: {
    "@type": "@id",
    "@container": "@set",
  },

  summary: {
    "@id": "summary",
  },
  status: {
    "@id": "status",
    "@type": "@id",
  },

  hasTask: { "@container": "@set" },
  knows: { "@container": "@set" },
};

export const bookmarkContext = defaultContext;
export const metaContext = defaultContext;
export const taskContext = defaultContext;
