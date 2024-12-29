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

export const connect = (address: any) => remoteStorage.connect(address);
export const disconnect = () => remoteStorage.disconnect();

export const getBookmarks = () =>
  remoteStorage["szuflada.app/bookmark"].getAll();
export const getBookmark = (bookmarkId: string) =>
  remoteStorage["szuflada.app/bookmark"].get(bookmarkId);
export const getBookmarkList = () =>
  remoteStorage["szuflada.app/meta"].getBookmarks();
export const deleteBookmark = (uuid: string) =>
  remoteStorage["szuflada.app/bookmark"].del(uuid);

export const addBookmark = (bookmark) =>
  remoteStorage["szuflada.app/meta"].addBookmark(bookmark);
export const delBookmark = (uuid) =>
  remoteStorage["szuflada.app/meta"].delBookmark(uuid);

export const getTasks = () => remoteStorage["szuflada.app/task"].getAll();
export const getTaskList = () => remoteStorage["szuflada.app/task"].get("/");

remoteStorage.on("sync-done", async () => {
  // Index
  const bookmarkList = Object.keys(
    await remoteStorage["szuflada.app/bookmark"].getListing(),
  );

  const bookmarkIndex = (await getBookmarkList())["szuflada:knows"].map(
    (item) => item["@id"],
  );

  const toAdd = Array.from(
    new Set(bookmarkList).difference(new Set(bookmarkIndex)),
  );

  const toRemove = Array.from(
    new Set(bookmarkIndex).difference(new Set(bookmarkList)),
  );

  if (toRemove.length) {
    delBookmark(toRemove[0]);
  }

  if (toAdd.length) {
    const bookmarkId = toAdd[Math.round(Math.random() * (toAdd.length - 1))];
    await addBookmark(await getBookmark(bookmarkId));
  }
});
