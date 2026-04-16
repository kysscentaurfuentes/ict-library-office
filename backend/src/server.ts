import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import jwt from 'jsonwebtoken';
import { resolvers } from './resolvers.js';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET as string;

const typeDefs = `#graphql
  type User {
    id: ID
    username: String
    StudentId: String # ✅ Added StudentId
    role: String
  }

  type AuthPayload {
    token: String
    user: User
  }

  type AdminResponse {
    message: String
  }

  type Query {
    hello: String
    me: User
    adminPanel: AdminResponse
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    # ✅ Added StudentId as required parameter
    signup(username: String!, password: String!, StudentId: String!): AuthPayload
  }
`;

async function getUserFromToken(token: string | undefined) {
  try {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanToken, SECRET) as {
      userId: number;
      role: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      const token = req.headers.authorization;
      const user = await getUserFromToken(token);
      return { authUser: user };
    },
  });

  console.log(`🚀 TS Server ready at ${url}`);
}

startServer();