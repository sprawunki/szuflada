import RemoteStorage from "remotestoragejs";
import Szuflada from "$lib/remotestorage/Szuflada";
import Bookmark from "$lib/remotestorage/Bookmark";
import Task from "$lib/remotestorage/Task";

type RemoteStorageInstance = {
  [key: string]: any;
};

export const remoteStorage: RemoteStorageInstance = new RemoteStorage({
  logging: false,
  changeEvents: {
    local: true,
    window: true,
    remote: true,
    conflict: true,
  },
  cache: true,
  modules: [Szuflada, Bookmark, Task],
});

remoteStorage.access.claim("szuflada.app", "rw");
// remoteStorage.setSyncInterval(30000);

export const connect = (address: any) => remoteStorage.connect(address);
export const disconnect = () => remoteStorage.disconnect();

export const indexTask = (task) =>
  remoteStorage["szuflada.app/meta"].addTask(task);
export const deindexTask = (uuid) =>
  remoteStorage["szuflada.app/meta"].delTask(uuid);

export const saveBookmark = (bookmark) =>
  remoteStorage["szuflada.app/bookmark"]
    .save(bookmark)
    .then((bookmark) => indexBookmark(bookmark));
export const getBookmark = (bookmarkId: string) =>
  remoteStorage["szuflada.app/bookmark"].get(bookmarkId);
export const getBookmarkList = () =>
  remoteStorage["szuflada.app/meta"].getBookmarks();
export const deleteBookmark = (uuid: string) =>
  remoteStorage["szuflada.app/bookmark"].del(uuid);

export const indexBookmark = (bookmark) =>
  remoteStorage["szuflada.app/meta"].addBookmark(bookmark);
export const delBookmark = (uuid) =>
  remoteStorage["szuflada.app/meta"].delBookmark(uuid);

export const saveTask = (task) =>
  remoteStorage["szuflada.app/task"].save(task).then(() => indexTask(task));
export const removeTask = (uuid) =>
  remoteStorage["szuflada.app/task"].delete(uuid).then(() => deindexTask(uuid));

export const getTask = (uuid) => remoteStorage["szuflada.app/task"].get(uuid);
export const getTaskList = () => remoteStorage["szuflada.app/meta"].getTasks();

remoteStorage.on("sync-done", async () => {
  // Index tasks
  const taskList = Object.keys(
    (await remoteStorage["szuflada.app/task"].getListing()) || {},
  );

  const taskIndex = (((await getTaskList()) ?? {})["hasTask"] ?? []).map(
    (item) => item["@id"],
  );

  const tasksToAdd = Array.from(
    new Set(taskList).difference(new Set(taskIndex)),
  );

  const tasksToRemove = Array.from(
    new Set(taskIndex).difference(new Set(taskList)),
  );

  if (tasksToRemove.length) {
    await deindexTask(tasksToRemove[0]);
  }

  if (tasksToAdd.length) {
    const taskId = Math.round(Math.random() * (tasksToAdd.length - 1));
    await getTask(tasksToAdd[taskId]).then((task) => indexTask(task));
  }

  // Index bookmarks
  const bookmarkList = Object.keys(
    (await remoteStorage["szuflada.app/bookmark"].getListing()) || {},
  );

  const bookmarkIndex = ((await getBookmarkList())["knows"] ?? []).map(
    (item) => item["@id"],
  );

  const toAdd = Array.from(
    new Set(bookmarkList).difference(new Set(bookmarkIndex)),
  );

  const toRemove = Array.from(
    new Set(bookmarkIndex).difference(new Set(bookmarkList)),
  );

  if (toRemove.length) {
    await delBookmark(toRemove[0]);
  }

  if (toAdd.length) {
    const bookmarkId = toAdd[Math.round(Math.random() * (toAdd.length - 1))];
    await getBookmark(bookmarkId).then((bookmark) => indexBookmark(bookmark));
  }
});
