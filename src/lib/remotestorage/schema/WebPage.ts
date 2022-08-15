const WebPage = {
  "type": "object",
  "properties": {
    "@id": {
      "type": "string",
      "format": "uuid",
    },
    "http://schema.org/name": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "@lang": { "type": "string" },
          "@language": { "type": "string" },
          "@value": { "type": "string" }
        },
      },
    },
    "http://schema.org/url": {
      "type": ["string", "null"],
      "format": "uri"
    },
  },
  "required": [ "@id", "http://schema.org/url" ]
}

export default WebPage
