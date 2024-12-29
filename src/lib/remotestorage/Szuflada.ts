import { bookmarkContext } from "$lib/jsonld/contexts";
import jsonld from "$lib/jsonld/jsonld";

const Szuflada = {
  name: "szuflada.app/meta",
  builder: function (privateClient: any, publicClient: any) {
    privateClient.cache("", "ALL");
    privateClient.declareType("meta", {});

    privateClient.on("change", (event) => {
      if (event.origin === "conflict") {
        privateClient.getObject(event.path.replace("/szuflada.app/meta/", ""));
      }

      document.dispatchEvent(
        new CustomEvent("urn:szuflada:bookmarks", { detail: event.newValue }),
      );
    });

    return {
      exports: {
        onChange: (callback) => privateClient.on("change", callback),

        getBookmarks: () =>
          privateClient.getObject("urn:szuflada:bookmarks", false),

        addBookmark: async (bookmark) => {
          const bookmarkList = await privateClient.getObject(
            "urn:szuflada:bookmarks",
            0,
          );

          const framed = await jsonld.frame(
            [
              bookmarkList,
              {
                "@context": bookmarkContext,
                "@graph": {
                  "@id": "urn:szuflada:me",
                  "szuflada:knows": bookmark,
                },
              },
            ],
            {
              "@context": bookmarkContext,
              "@id": "urn:szuflada:me",
              "szuflada:knows": {
                "dc:created": {},
                "dc:date": {},
                "@explicit": "@true",
                "@requireAll": "@false",
              },
              "@explicit": "@true",
              "@requireAll": "@true",
            },
          );

          framed["szuflada:knows"] = framed["szuflada:knows"].sort((a, b) =>
            b["dc:created"].localeCompare(a["dc:created"]),
          );

          privateClient.storeObject("meta", "urn:szuflada:bookmarks", framed);
        },

        delBookmark: async (uuid: string) => {
          const bookmarkList = await privateClient.getObject(
            "urn:szuflada:bookmarks",
            0,
          );

          const framed = await jsonld.frame([bookmarkList], {
            "@context": bookmarkContext,
            "@id": "urn:szuflada:me",
            "szuflada:knows": {
              "dc:created": {},
              "dc:date": {},
              "@explicit": "@true",
              "@requireAll": "@false",
            },
            "@explicit": "@true",
            "@requireAll": "@true",
          });

          framed["szuflada:knows"] = framed["szuflada:knows"].filter(
            (item) => item["@id"] !== uuid,
          );

          privateClient.storeObject("meta", "urn:szuflada:bookmarks", framed);
        },
      },
    };
  },
};

export default Szuflada;
