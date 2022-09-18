const BookmarkSchema = {
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
    "http://www.w3.org/2002/01/bookmark#title": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "@value": {
            "type": "string"
          },
        },
      },
    },
    "http://www.w3.org/2002/01/bookmark#recalls": {
      "type": "object",
      "properties": {
        "@id": {
          "type": "string",
          "format": "url",
        },
      },
    }
  },
  "required": [
    "@id",
    "@type",
    "http://purl.org/dc/elements/1.1/#created",
    "http://purl.org/dc/elements/1.1/#date",
    "http://www.w3.org/2002/01/bookmark#recalls",
  ]
}

export default BookmarkSchema
