const { ApolloServer, PubSub } = require('apollo-server')
const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const { createToken, getUserFromToken } = require('./auth')
const db = require('./db')

const pubSub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({ req, connection }) {

    if (connection) {
      return { ...connection.context, ...db, createToken, pubSub }
    }
    const token = req.headers.authorization
    const user = getUserFromToken(token)
    return { ...db, user, createToken, pubSub }
  },
  subscriptions: {
    onConnect(params) {
      const token = params.Authorization
      const user = getUserFromToken(token)
      return { user }
    }
  }

})

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
