import RemoteStorage from 'remotestoragejs'
import BookmarkSchema from '$lib/remotestorage/schema/Bookmark'
import { v5 as uuidv5 } from 'uuid'

import { bookmarks } from '$lib/store'

const Bookmark = {
  name: 'szuflada.app/bookmark',
  builder: function(privateClient: any, publicClient: any) {
    privateClient.declareType('Bookmark', BookmarkSchema);

    privateClient.on('change', (event) => {
      console.debug(event)

      if (!event.newValue && event.oldValue['@id']) {
        bookmarks.update(items => { delete items[event.oldValue['@id']]; return items })
      }

      if (event.newValue) {
        bookmarks.update(items => { items[event.newValue['@id']] = event.newValue; return items })
      }
    })

    return {
      exports: {
        save: (objectData: any) => {
          return privateClient.getObject(objectData['@id'])
            .then(object => {
              if (object && object['http://purl.org/dc/elements/1.1/#created']) {
                objectData['http://purl.org/dc/elements/1.1/#created'] = object['http://purl.org/dc/elements/1.1/#created']
              }

              return objectData
            })
            .then(objectData => privateClient.storeObject(
            "Bookmark",
            `${objectData['@id']}`,
            objectData
          )).then((result: any) => {
            return privateClient.getObject(
              `${objectData['@id']}`
            )
          })
        },
        get: (uuid: any) => privateClient.getObject(
          `${uuid}`
        ),
        delete: (uuid: any) => privateClient.remove(
          `${uuid}`
        ),
        getList: () => {
          return privateClient.getListing("/")
            .then(listing => Object.keys(listing))
            .then(uuids => uuids.forEach(uuid => privateClient.getObject(uuid)))
        }
      }
    }
  }
}

export default Bookmark
