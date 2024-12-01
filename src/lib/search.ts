import flexsearch from "flexsearch";

const search = new flexsearch.Document({
  tokenize: "forward",
  encoder: "extra",
  bidirectional: true,
  resolution: 1,
  charset: "latin:advanced",
  document: {
    id: "@id",
    index: ["title"],
  },
});

export default search;
