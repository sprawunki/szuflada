const TaskIndexSchema = {
  type: "object",
  properties: {
    hasTask: {
      type: "array",
      items: {
        type: "object",
        properties: {
          "@id": {
            type: "string",
            format: "iri",
          },
          "@type": {
            type: "string",
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
        required: [
          "@id",
          "@type",
          "dc:created",
          "dc:date",
          "moreImportantThan",
          "lessImportantThan",
          "status",
        ],
      },
    },
  },
};

export default TaskIndexSchema;
