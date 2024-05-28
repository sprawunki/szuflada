import RemoteStorage from 'remotestoragejs'
import BookmarkSchema from '$lib/remotestorage/schema/Bookmark'
import { v5 as uuidv5 } from 'uuid'
import * as jsonld from 'jsonld'

const Bookmark = {
  name: 'szuflada.app/bookmark',
  builder: function(privateClient: any, publicClient: any) {
    privateClient.declareType('Bookmark', BookmarkSchema)
    privateClient.cache('', 'ALL')

    return {
      exports: {
        getPrivateClient: () => privateClient,
        save: (objectData: any) => {
          return privateClient
            .getObject(objectData['@id'])
            .then(object => {
              if (object && object['http://purl.org/dc/elements/1.1/#created']) {
                objectData['http://purl.org/dc/elements/1.1/#created'] = object['http://purl.org/dc/elements/1.1/#created']
              }

              if (Array.isArray(objectData['http://purl.org/dc/elements/1.1/#created'])) {
                objectData['http://purl.org/dc/elements/1.1/#created'] = objectData['http://purl.org/dc/elements/1.1/#created'][0]['@value']
              }

              if (Array.isArray(objectData['http://www.w3.org/2002/01/bookmark#title'])) {
                objectData['http://www.w3.org/2002/01/bookmark#title'] = objectData['http://www.w3.org/2002/01/bookmark#title'][0]
              }

              if (typeof objectData['http://www.w3.org/2002/01/bookmark#title'] == 'string') {
                objectData['http://www.w3.org/2002/01/bookmark#title'] = {
                  '@value': objectData['http://www.w3.org/2002/01/bookmark#title']
                }
              }

              return objectData
            })
            .then(objectData => privateClient
              .storeObject("Bookmark", `${objectData['@id']}`, objectData)
            )
            .then((result: any) => privateClient
              .getObject(`${objectData['@id']}`, false)
            )
        },
        get: (uuid: any) => privateClient
          .getObject(uuid),
        getAll: () => privateClient
          .getAll('', false),
        getListing: () => privateClient
          .getListing('', 0)
      }
    }
  }
}

export default Bookmark
