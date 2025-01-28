const TaskSchema = {
  type: "object",
  properties: {
    "@id": {
      type: "string",
      format: "iri",
    },
    "@type": {
      type: "string",
      format: "url",
    },
    "dc:created": {
      type: "string",
      format: "date-time",
    },
    "dc:date": {
      type: "string",
      format: "date-time",
    },
    status: {
      type: "string",
    },
    summary: {
      type: "string",
    },
    moreImportantThan: {
      type: "array",
      items: {
        type: "string",
        format: "url",
      },
    },
    lessImportantThan: {
      type: "array",
      items: {
        type: "string",
        format: "url",
      },
    },
  },
  required: ["@id", "@type", "dc:created", "dc:date", "summary"],
};

export default TaskSchema;
