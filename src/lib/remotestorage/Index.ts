const Index = {
  name: 'szuflada.app/index',
  builder: function(privateClient: any, publicClient: any) {
    return {
      exports: {
        getPrivateClient: () => privateClient,
        put: (id: any, objectData: any) => privateClient.storeFile("application/n-quads", `${id}.nq`, objectData),
        get: (id: any) => privateClient.getFile(`${id}.nq`),
        getAll: () => privateClient.getAll("/")
      }
    }
  }
}

export default Index
