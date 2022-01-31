  import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http'
import path from 'path'
import { readFileSync } from 'fs'
import resolvers from './graphql/resolvers'

dotenv.config({path: './.env'})
export const app = express()
const httpServer = http.createServer(app)

const typeDefs = readFileSync(path.join(__dirname, 'graphql/schema.graphql'), 'utf8')

app.use(cors({
  origin:[
    'http://localhost:3000', 
    'https://utec-seminars.feraguilar.tech', 
    'https://api-seminars.feraguilar.tech',
    'http://localhost:4000',
    'https://studio.apollographql.com'
  ]
}))

const startApolloServer = async() => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({req}) => {
      const token = req.headers.authorization || ''
      return {token}
    }
  })
  await server.start()
  server.applyMiddleware({app})
  await new Promise<void>(resolve => httpServer.listen({ port: process.env.PORT }, resolve))
}

startApolloServer()