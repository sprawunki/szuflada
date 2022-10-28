import RemoteStorage from 'remotestoragejs'
import Bookmark from '$lib/remotestorage/Bookmark'

type RemoteStorageInstance = {
  [key: string]: any
}

export const remoteStorage: RemoteStorageInstance = new RemoteStorage({
  logging: false,
  changeEvents: {
    local:    true,
    window:   true,
    remote:   true,
    conflict: true
  },
  cache: true,
  modules: [Bookmark]
});

remoteStorage.access.claim('szuflada.app', 'rw');

remoteStorage.on('error', function() {
  remoteStorage.disconnect()
})

export const connect = (address: any) => remoteStorage.connect(address)
export const disconnect = () => remoteStorage.disconnect()

export const getBookmarks = () => remoteStorage['szuflada.app/bookmark'].getAll()
