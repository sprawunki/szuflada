import RemoteStorage from 'remotestoragejs'
import WebPage from '$lib/remotestorage/WebPage'

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
  modules: [WebPage]
});

remoteStorage.access.claim('szuflada.app', 'rw');

remoteStorage.on('connected', function() {
  console.debug("RS connected")
})

remoteStorage.on('error', function() {
  remoteStorage.disconnect()
})

export const connect = (address: any) => remoteStorage.connect(address)
export const disconnect = () => remoteStorage.disconnect()
