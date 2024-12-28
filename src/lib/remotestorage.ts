import RemoteStorage from "remotestoragejs";
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
  modules: [Bookmark, Task],
});

remoteStorage.access.claim("szuflada.app", "rw");

export const connect = (address: any) => remoteStorage.connect(address);
export const disconnect = () => remoteStorage.disconnect();

export const getBookmarks = () =>
  remoteStorage["szuflada.app/bookmark"].getAll();
export const getBookmark = (bookmarkId) =>
  remoteStorage["szuflada.app/bookmark"].get(bookmarkId);
export const getBookmarkList = () =>
  remoteStorage["szuflada.app/bookmark"].get("/");
export const deleteBookmark = (uuid: string) =>
  remoteStorage["szuflada.app/bookmark"].del(uuid);

export const getTasks = () => remoteStorage["szuflada.app/task"].getAll();
export const getTaskList = () => remoteStorage["szuflada.app/task"].get("/");
