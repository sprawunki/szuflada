import RemoteStorage from 'remotestoragejs'
import TaskSchema from '$lib/remotestorage/schema/Task'
import { v5 as uuidv5 } from 'uuid'
import * as jsonld from 'jsonld'

const Task = {
  name: 'szuflada.app/task',
  builder: function(privateClient: any, publicClient: any) {
    privateClient.declareType('Task', TaskSchema);

    return {
      exports: {
        getPrivateClient: () => privateClient,
        save: (objectData: any) => {
          return privateClient.getObject(objectData['@id'])
            .then(object => {
              if (object && object['http://purl.org/dc/elements/1.1/#created']) {
                objectData['http://purl.org/dc/elements/1.1/#created'] = object['http://purl.org/dc/elements/1.1/#created']
              }

              return objectData
            })
            .then(objectData => privateClient.storeObject(
            "Task",
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
        getAll: () => {
          return privateClient.getAll("/")
        }
      }
    }
  }
}

export default Task
