import {
  metaContext,
  bookmarkContext,
  taskContext,
} from "$lib/jsonld/contexts";
import jsonld from "$lib/jsonld/jsonld";
import graphlib from "@dagrejs/graphlib";
import TaskIndexSchema from "$lib/remotestorage/schema/TaskIndex";
import { getTask } from "$lib/remotestorage";
import { browser } from "$app/environment";

const Szuflada = {
  name: "szuflada.app/meta",
  builder: function (privateClient: any, publicClient: any) {
    privateClient.cache("", "ALL");
    privateClient.declareType("meta", {});
    privateClient.declareType("TaskIndex", TaskIndexSchema);

    privateClient.on("change", (event) => {
      if (event.origin === "conflict") {
        privateClient.getObject(event.relativePath);
      }

      if (!browser) return;

      document.dispatchEvent(
        new CustomEvent(event.relativePath, { detail: event.newValue }),
      );
    });

    const getBookmarkIndex = async () =>
      privateClient
        .getObject("urn:szuflada:bookmarks", false)
        .then((bookmarks) =>
          jsonld.frame(
            [
              bookmarks,
              {
                "@context": metaContext,
                "@id": "urn:szuflada:me",
                knows: [],
              },
            ],
            {
              "@context": metaContext,
              "@id": "urn:szuflada:me",
              knows: {
                "dc:created": {},
                "dc:date": {},
                "@explicit": "@true",
                "@requireAll": "@false",
              },
              "@explicit": "@true",
              "@requireAll": "@true",
            },
          ),
        );

    const getTaskIndex = async () =>
      privateClient.getObject("urn:szuflada:tasks", false).then((tasks) =>
        jsonld.frame(
          [
            {
              "@context": metaContext,
              "@id": "urn:szuflada:me",
              hasTask: [],
            },
            tasks,
          ],
          {
            "@context": metaContext,
            "@id": "urn:szuflada:me",
            hasTask: {
              "@type": {},
              "dc:created": {},
              "dc:date": {},
              moreImportantThan: { "@default": [], "@embed": "@never" },
              lessImportantThan: { "@default": [], "@embed": "@never" },
              deadline: { "@default": "@null" },
              scheduled: { "@default": "@null" },
              status: { "@default": "http://szuflada.app/ns#ToDo" },
              "@embed": "@always",
              "@explicit": true,
              "@requireAll": false,
            },
            "@embed": "@never",
            "@explicit": true,
            "@requireAll": true,
          },
        ),
      );

    return {
      exports: {
        onChange: (callback) => privateClient.on("change", callback),

        getBookmarks: () => getBookmarkIndex(),

        addBookmark: async (bookmark) => {
          const bookmarkList = await privateClient.getObject(
            "urn:szuflada:bookmarks",
          );

          const framed = await jsonld.frame(
            [
              bookmarkList,
              {
                "@context": bookmarkContext,
                "@graph": {
                  "@id": "urn:szuflada:me",
                  knows: bookmark,
                },
              },
            ],
            {
              "@context": bookmarkContext,
              "@id": "urn:szuflada:me",
              knows: {
                "dc:created": {},
                "dc:date": {},
                "@explicit": "@true",
                "@requireAll": "@false",
              },
              "@explicit": "@true",
              "@requireAll": "@true",
            },
          );

          framed["knows"] = framed["knows"].sort((a, b) =>
            b["dc:created"].localeCompare(a["dc:created"]),
          );

          return privateClient.storeObject(
            "meta",
            "urn:szuflada:bookmarks",
            framed,
          );
        },

        delBookmark: async (uuid: string) => {
          const bookmarkList = await privateClient.getObject(
            "urn:szuflada:bookmarks",
          );

          const framed = await jsonld.frame([bookmarkList], {
            "@context": bookmarkContext,
            "@id": "urn:szuflada:me",
            knows: {
              "dc:created": {},
              "dc:date": {},
              "@explicit": "@true",
              "@requireAll": "@false",
            },
            "@explicit": "@true",
            "@requireAll": "@true",
          });

          framed["knows"] = framed["knows"].filter(
            (item) => item["@id"] !== uuid,
          );

          return privateClient.storeObject(
            "meta",
            "urn:szuflada:bookmarks",
            framed,
          );
        },

        getTasks: () => getTaskIndex(),

        addTask: async (task) => {
          const taskList = await getTaskIndex();

          if (taskList["hasTask"]) {
            taskList["hasTask"] = taskList["hasTask"].filter(
              (item) => !task || item["@id"] !== task["@id"],
            );
          }

          const framed = await jsonld.frame(
            [
              taskList,
              {
                "@context": taskContext,
                "@id": "urn:szuflada:me",
                hasTask: task,
              },
            ],
            {
              "@context": metaContext,
              "@id": "urn:szuflada:me",
              hasTask: {
                "@type": {},
                "dc:created": {},
                "dc:date": {},
                moreImportantThan: { "@default": [], "@embed": "@never" },
                lessImportantThan: { "@default": [], "@embed": "@never" },
                deadline: { "@default": "@null" },
                scheduled: { "@default": "@null" },
                status: { "@default": "http://szuflada.app/ns#ToDo" },
                "@embed": "@always",
                "@explicit": true,
                "@requireAll": false,
              },
              "@embed": "@never",
              "@explicit": true,
              "@requireAll": true,
            },
          );
          return privateClient.storeObject(
            "TaskIndex",
            "urn:szuflada:tasks",
            framed,
          );
        },

        delTask: async (uuid: string) => {
          const taskList = await privateClient.getObject("urn:szuflada:tasks");

          const framed = await jsonld.frame([taskList], {
            "@context": metaContext,
            "@id": "urn:szuflada:me",
            hasTask: {
              "@type": {},
              "dc:created": {},
              "dc:date": {},
              moreImportantThan: { "@default": [], "@embed": "@never" },
              lessImportantThan: { "@default": [], "@embed": "@never" },
              deadline: { "@default": "@null" },
              scheduled: { "@default": "@null" },
              status: { "@default": "http://szuflada.app/ns#ToDo" },
              "@embed": "@always",
              "@explicit": true,
              "@requireAll": false,
            },
            "@embed": "@never",
            "@explicit": true,
            "@requireAll": true,
          });

          framed["hasTask"] = framed["hasTask"].filter(
            (item) => item["@id"] !== uuid,
          );

          return privateClient.storeObject(
            "TaskIndex",
            "urn:szuflada:tasks",
            framed,
          );
        },
      },
    };
  },
};

export default Szuflada;
