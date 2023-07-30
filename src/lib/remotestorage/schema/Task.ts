const TaskSchema = {
  "type": "object",
  "properties": {
    "@id": {
      "type": "string",
      "format": "iri",
    },
    "@type": {
      "type": "string",
      "format": "url",
    },
    "http://purl.org/dc/elements/1.1/#created": {
      "type": "string",
      "format": "date-time",
    },
    "http://purl.org/dc/elements/1.1/#date": {
      "type": "string",
      "format": "date-time",
    },
    "https://szuflada.app/ns/summary": {
      "type": "string",
    },
    "https://szuflada.app/ns/before": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "@id": {
            "type": "string",
            "format": "url",
          },
        },
      },
    },
    "https://szuflada.app/ns/after": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "@id": {
            "type": "string",
            "format": "url",
          },
        },
      },
    },
    "https://szuflada.app/ns/status": {
      "type": "string",
      "format": "url",
    },
  },
  "required": [
    "@id",
    "@type",
    "http://purl.org/dc/elements/1.1/#created",
    "http://purl.org/dc/elements/1.1/#date",
    "https://szuflada.app/ns/summary",
  ]
}

export default TaskSchema
