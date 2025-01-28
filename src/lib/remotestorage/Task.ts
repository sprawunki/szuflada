import { taskFrame } from "$lib/jsonld/frames";
import jsonld from "$lib/jsonld/jsonld";
import TaskSchema from "$lib/remotestorage/schema/Task";

const Task = {
  name: "szuflada.app/task",
  builder: function (privateClient: any, publicClient: any) {
    privateClient.declareType("Task", TaskSchema);
    privateClient.cache("", "ALL");

    privateClient.on("change", (event) => {
      if (event.origin === "conflict") {
        privateClient.getObject(event.relativePath, 0);
      }
    });

    return {
      exports: {
        save: (objectData: any) => {
          return privateClient
            .getObject(objectData["@id"])
            .then((task) => jsonld.frame(task, taskFrame))
            .then((object) => {
              if (object && object["dc:created"]) {
                objectData["dc:created"] = object["dc:created"];
              }

              return objectData;
            })
            .then((objectData) =>
              privateClient.storeObject(
                "Task",
                `${objectData["@id"]}`,
                objectData,
              ),
            )
            .then((result: any) => {
              return privateClient.getObject(`${objectData["@id"]}`);
            });
        },

        get: (uuid: any) =>
          privateClient.getObject(uuid, false).then((task) => {
            if (!task) {
              return task;
            }

            delete task["done"];
            delete task["blocked"];
            delete task["status"];

            task = JSON.parse(
              JSON.stringify(task)
                .replaceAll('after":', 'lessImportantThan":')
                .replaceAll('before":', 'moreImportantThan":')
                .replaceAll(
                  '"https://szuflada.app/ns/',
                  '"http://szuflada.app/ns#',
                ),
            );

            if (typeof task["http://szuflada.app/ns#status"] === "string") {
              task["http://szuflada.app/ns#status"] = {
                "@id": task["http://szuflada.app/ns#status"],
              };
            }

            return task["@type"] ? jsonld.frame(task, taskFrame) : task;

            task["http://szuflada.app/ns#status"] =
              task["http://szuflada.app/ns#status"] ??
              task["https://szuflada.app/ns/status"];

            if (task["http://szuflada.app/ns#status"]) {
              task["http://szuflada.app/ns#status"] = task[
                "http://szuflada.app/ns#status"
              ].replace("https://szuflada.app/ns/", "http://szuflada.app/ns#");
            }

            delete task["https://szuflada.app/ns/status"];

            task["http://szuflada.app/ns#summary"] =
              task["http://szuflada.app/ns#summary"] ??
              task["https://szuflada.app/ns/summary"];

            delete task["https://szuflada.app/ns/summary"];

            task["http://szuflada.app/ns#moreImportantThan"] =
              task["http://szuflada.app/ns#moreImportantThan"] ??
              task["https://szuflada.app/ns/before"];

            delete task["https://szuflada.app/ns/before"];

            task["http://szuflada.app/ns#lessImportantThan"] =
              task["http://szuflada.app/ns#lessImportantThan"] ??
              task["https://szuflada.app/ns/after"];

            delete task["https://szuflada.app/ns/after"];

            task["http://szuflada.app/ns#deadline"] =
              task["http://szuflada.app/ns#deadline"] ??
              task["https://szuflada.app/ns/deadline"];

            delete task["https://szuflada.app/ns/deadline"];

            task["http://szuflada.app/ns#scheduled"] =
              task["http://szuflada.app/ns#scheduled"] ??
              task["https://szuflada.app/ns/scheduled"];

            delete task["https://szuflada.app/ns/scheduled"];

            return task;
          }),

        getListing: () => privateClient.getListing("", false),

        delete: (uuid: any) => privateClient.remove(`${uuid}`),
      },
    };
  },
};

export default Task;
