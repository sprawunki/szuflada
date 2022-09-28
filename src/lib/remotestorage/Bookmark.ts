import RemoteStorage from 'remotestoragejs'
import BookmarkSchema from '$lib/remotestorage/schema/Bookmark'
import { v5 as uuidv5 } from 'uuid'
import * as jsonld from 'jsonld'
import { bookmarks } from '$lib/store'

const Bookmark = {
  name: 'szuflada.app/bookmark',
  builder: function(privateClient: any, publicClient: any) {
    privateClient.declareType('Bookmark', BookmarkSchema);

    privateClient.on('change', (event) => {
      if (!event.newValue && event.oldValue['@id']) {
        bookmarks.update(items => { delete items[event.oldValue['@id']]; return items })
      }

      if (event.newValue) {
        delete event.newValue['@context']

        jsonld.frame(
          event.newValue,
          {
            "http://www.w3.org/2002/01/bookmark#recalls": {},
            "http://www.w3.org/2002/01/bookmark#title": {},
            "http://purl.org/dc/elements/1.1/#created": {},
            "@explicit": true,
          }
        )
        .then(graph => jsonld.compact(
          graph,
          {
            "@context": {
              "created": "http://purl.org/dc/elements/1.1/#created",
              "title": "http://www.w3.org/2002/01/bookmark#title",
              "recalls": "http://www.w3.org/2002/01/bookmark#recalls"
            }
          }
        ))
        .then(graph => {
          bookmarks.update(items => { items[graph['@id']] = graph; return items })
        })
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
        getAll: () => privateClient.getAll("/")
      }
    }
  }
}

export default Bookmark
