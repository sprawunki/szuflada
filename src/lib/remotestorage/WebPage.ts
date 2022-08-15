import RemoteStorage from 'remotestoragejs'
import WebPageSchema from '$lib/remotestorage/schema/WebPage'
import { v5 as uuidv5 } from 'uuid'

import { bookmarks } from '$lib/store'

const WebPage = {
  name: 'szuflada.app/WebPage',
  builder: function(privateClient: any, publicClient: any) {
    privateClient.declareType('WebPage', WebPageSchema);

    privateClient.on('change', (event) => {
      bookmarks.update(items => {
        items.push(event.newValue)
        return items
      })
    })

    return {
      exports: {
        save: (productData: any) => {
          productData['@id'] = uuidv5(productData['http://schema.org/url'], uuidv5.URL)

          return privateClient.storeObject(
            "WebPage",
            `${productData['@id']}`,
            productData
          ).then((result: any) => {
            return privateClient.getObject(
              `${productData['@id']}`
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
            .then((listing: any) => Object.keys(listing)
              .map((key: string) => (key.charAt(key.length - 1) === '/') ? key.slice(0, -1) : key)
              .map((key: string) => privateClient.getObject(`${key}`))
            )
            .then((result: any) => Promise.all(result))
            .then((result: any) => result
              .filter(
                (item: any) => item && item['@id']
              )
            )
            .then((result: any) => result
              .sort((a: any, b: any) => a["http://schema.org/name"][0]["@value"]
                .localeCompare(
                  b["http://schema.org/name"][0]["@value"]
                )
              )
            )
        }
      }
    }
  }
}

export default WebPage
