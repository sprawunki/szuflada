const Index = {
  name: 'szuflada.app/index',
  builder: function(privateClient: any, publicClient: any) {
    return {
      exports: {
        getPrivateClient: () => privateClient,
        put: (id: any, objectData: any) => privateClient
          .storeFile("application/n-quads", id, objectData),
        get: (id: any) => privateClient
          .getFile(id),
        getAll: () => privateClient
          .getAll("/")
          .then((indices: any) => Object.keys(indices))
          .then((indices: string[]) => indices.map((index: string) => privateClient.getFile(index)))
          .then((indices: string[]) => Promise.all(indices))
      }
    }
  }
}

export default Index
