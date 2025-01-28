import RemoteStorage from "remotestoragejs";
import BookmarkSchema from "$lib/remotestorage/schema/Bookmark";
import { v5 as uuidv5 } from "uuid";
import * as jsonld from "jsonld";
import { browser } from "$app/environment";

const Bookmark = {
  name: "szuflada.app/bookmark",
  builder: function (privateClient: any, publicClient: any) {
    privateClient.declareType("Bookmark", BookmarkSchema);
    privateClient.cache("", "ALL");

    privateClient.on("change", (event) => {
      if (event.origin === "conflict") {
        privateClient.getObject(event.relativePath);
      }

      if (!browser) return;

      document.dispatchEvent(
        new CustomEvent("bookmark", { detail: event.newValue }),
      );

      document.dispatchEvent(
        new CustomEvent(event.path.replace("/szuflada.app/bookmark/", ""), {
          detail: event.newValue,
        }),
      );
    });

    return {
      exports: {
        save: (objectData: any) => {
          return privateClient
            .getObject(objectData["@id"])
            .then((object) => {
              if (
                object &&
                object["http://purl.org/dc/elements/1.1/#created"]
              ) {
                objectData["http://purl.org/dc/elements/1.1/#created"] =
                  object["http://purl.org/dc/elements/1.1/#created"];
              }

              if (
                Array.isArray(
                  objectData["http://purl.org/dc/elements/1.1/#created"],
                )
              ) {
                objectData["http://purl.org/dc/elements/1.1/#created"] =
                  objectData["http://purl.org/dc/elements/1.1/#created"][0][
                    "@value"
                  ];
              }

              if (
                Array.isArray(
                  objectData["http://www.w3.org/2002/01/bookmark#title"],
                )
              ) {
                objectData["http://www.w3.org/2002/01/bookmark#title"] =
                  objectData["http://www.w3.org/2002/01/bookmark#title"][0];
              }

              if (
                typeof objectData["http://www.w3.org/2002/01/bookmark#title"] ==
                "string"
              ) {
                objectData["http://www.w3.org/2002/01/bookmark#title"] = {
                  "@value":
                    objectData["http://www.w3.org/2002/01/bookmark#title"],
                };
              }

              return objectData;
            })
            .then((objectData) =>
              privateClient.storeObject(
                "Bookmark",
                `${objectData["@id"]}`,
                objectData,
              ),
            )
            .then((result: any) =>
              privateClient.getObject(`${objectData["@id"]}`, false),
            );
        },

        get: (uuid: string) => privateClient.getObject(uuid, false),

        getListing: () => privateClient.getListing("", false),

        del: (uuid) => privateClient.remove(uuid),
      },
    };
  },
};

export default Bookmark;
