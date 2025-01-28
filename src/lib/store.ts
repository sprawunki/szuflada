import { default as moment } from "moment";
import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";
import graphlib from "@dagrejs/graphlib";
const { Graph, alg } = graphlib;

import jsonld from "$lib/jsonld/jsonld";
import { bookmarkContext, taskContext } from "$lib/jsonld/contexts";

import search from "$lib/search";
import {
  getBookmark,
  getBookmarkList,
  getTask,
  getTaskList,
} from "./remotestorage";

export const searchQuery = writable("");

const isDone = (task) =>
  task["https://szuflada.app/ns/status"] == "https://szuflada.app/ns/done";

export const bookmarks = (id: string) => {
  const bookmark = writable({});

  getBookmark(id)
    .then((bookmark) =>
      jsonld.frame(bookmark, {
        "@context": bookmarkContext,
        "@embed": "@always",
      }),
    )
    .then((data) => {
      bookmark.set(data);
    });

  bookmark.subscribe(() => {
    if (!browser) {
      return;
    }
    const updateBookmark = (event) =>
      getBookmark(event.type)
        .then((bookmark) =>
          jsonld.frame(bookmark, {
            "@context": bookmarkContext,
            "@type": "bookmark:Bookmark",
            "@embed": "@always",
          }),
        )
        .then((data) => {
          bookmark.set(data);
        });

    document.addEventListener(id, updateBookmark, false);

    return (): void => {
      document.removeEventListener(id, updateBookmark, false);
    };
  });

  return bookmark;
};

const updateSearch = (event) =>
  jsonld
    .frame(event.detail, {
      "@context": {
        title: "http://www.w3.org/2002/01/bookmark#title",
        recalls: "http://www.w3.org/2002/01/bookmark#recalls",
      },
      title: {},
      recalls: {},
      "@explicit": "@true",
    })
    .then((graph) => {
      if (!graph.recalls) {
        return;
      }
      graph["recalls"] = new URL(graph["recalls"]["@id"]).host;
      search.add(graph);
      searchQuery.update((query) => query);
    });

export const bookmarkList = (() => {
  const list = writable([]);

  const updateList = (event) => {
    event.detail && event.detail["knows"]
      ? list.set(event.detail["knows"].map((item) => item["@id"]))
      : false;
  };

  list.subscribe(() => {
    if (!browser) {
      return;
    }

    document.addEventListener("bookmark", updateSearch, false);
    document.addEventListener("urn:szuflada:bookmarks", updateList, false);

    return () => {
      document.removeEventListener("bookmark", updateSearch, false);
      document.removeEventListener("urn:szuflada:bookmarks", updateList, false);
    };
  });

  getBookmarkList().then((graph) => updateList({ detail: graph }));

  return list;
})();

export const bookmarksFiltered = derived(
  [bookmarkList, searchQuery],
  ([$bookmarkList, $searchQuery]) => {
    if ($searchQuery === "") {
      return $bookmarkList;
    }

    const searchResults = search
      .search($searchQuery)
      .map((item) => item.result)
      .flat();

    return $bookmarkList.filter((bookmark) => searchResults.includes(bookmark));
  },
);

export const tasks = (id: string) => {
  const task = writable({});

  getTask(id)
    .then((task) =>
      jsonld.frame(task, {
        "@context": taskContext,
        "@embed": "@always",
      }),
    )
    .then((data) => {
      task.set(data);
    });

  return task;
};

export const taskList = (() => {
  const list = writable([]);

  const updateList = (event) => {
    event.detail && event.detail["hasTask"]
      ? list.set(event.detail["hasTask"])
      : false;
  };

  list.subscribe(() => {
    if (!browser) {
      return;
    }

    document.addEventListener("urn:szuflada:tasks", updateList, false);

    return () => {
      document.removeEventListener("urn:szuflada:tasks", updateList, false);
    };
  });

  getTaskList().then((graph) => updateList({ detail: graph }));

  return list;
})();

export const taskGraphComponents = derived(taskList, ($tasks) => {
  const graph = new Graph();

  $tasks
    .filter((task) => !["#done", "#Done"].includes(task["status"]))
    .forEach((task) => {
      graph.setNode(task["@id"]);
    });

  $tasks
    .filter((task) => !["#done", "#Done"].includes(task["status"]))
    .forEach((task) => {
      (task["moreImportantThan"] ?? [])
        .filter((node) => graph.nodes().includes(node))
        .forEach((before) => {
          graph.setEdge(task["@id"], before);
        });

      (task["lessImportantThan"] ?? [])
        .filter((node) => graph.nodes().includes(node))
        .forEach((after) => {
          graph.setEdge(after, task["@id"]);
        });
    });

  while (
    graph.sources().length < 2 &&
    graph.nodes().length > 1 &&
    alg.isAcyclic(graph)
  ) {
    graph.removeNode(alg.topsort(graph)[0]);
  }

  return graph.sources();
});

const tasksByImportance = derived(taskList, ($tasks) => {
  const graph = new Graph();

  $tasks
    .filter((task) => !["#done", "#Done"].includes(task["status"]))
    .forEach((task) => {
      graph.setNode(task["@id"]);
    });

  $tasks
    .filter((task) => !["#done", "#Done"].includes(task["status"]))
    .forEach((task) => {
      (task["moreImportantThan"] ?? []).forEach((before) => {
        graph.setEdge(task["@id"], before);
      });

      (task["lessImportantThan"] ?? []).forEach((after) => {
        graph.setEdge(after, task["@id"]);
      });
    });

  if (!alg.isAcyclic(graph)) {
    return $tasks.map((item) => item["@id"]);
  }

  return alg.topsort(graph);
});

export const tasksSorted = derived([taskList, tasksByImportance], ($tasks) => {
  const now = new Date();

  return $tasks[0].sort(
    (a, b) =>
      (b["status"].toLowerCase() !== "#done") -
        (a["status"].toLowerCase() !== "#done") ||
      !!b["deadline"] - !!a["deadline"] ||
      (a["deadline"] ? +new Date(a["deadline"]) : 0) -
        (b["deadline"] ? +new Date(b["deadline"]) : 0) ||
      (a["scheduled"] ? new Date(a["scheduled"]) : now) -
        (b["scheduled"] ? new Date(b["scheduled"]) : now) ||
      $tasks[1].indexOf(a["@id"]) - $tasks[1].indexOf(b["@id"]) ||
      new Date(a["dc:created"]) - new Date(b["dc:created"]),
  );
});

export const cycles = derived(taskList, ($tasks) => {
  const graph = new Graph();

  $tasks.forEach((task) => {
    graph.setNode(task["@id"]);
  });

  $tasks.forEach((task) => {
    (task["moreImportantThan"] ?? []).forEach((before) => {
      graph.setEdge(task["@id"], before);
    });

    (task["lessImportantThan"] ?? []).forEach((after) => {
      graph.setEdge(after, task["@id"]);
    });
  });

  if (alg.isAcyclic(graph)) {
    return [];
  }

  return alg.findCycles(graph).sort((a, b) => a.length - b.length);
});
