import { taskContext } from "$lib/jsonld/contexts";

export const taskFrame = {
  "@context": taskContext,
  "@type": {},
  "dc:created": {},
  "dc:date": {},
  summary: {},
  status: {
    "@default": "http://szuflada.app/ns#ToDo",
  },
  moreImportantThan: { "@default": [] },
  lessImportantThan: { "@default": [] },
  deadline: { "@default": "@null" },
  scheduled: { "@default": "@null" },
  "@embed": "@never",
  "@explcit": false,
  "@requireAll": true,
};
