import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Pool } from 'pg';

// Database Connection with explicit types
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ict_library_db',
  password: '5785498', 
  port: 5432,
});

// GraphQL Schema
const typeDefs = `#graphql
  type User {
    id: ID
    username: String
    role: String
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    hello: String
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
  }
`;

// Define Interfaces for our data
interface UserRow {
  id: number;
  username: string;
  password:  string;
  role: string;
}

// Resolvers
const resolvers = {
  Query: {
    hello: (): string => "Backend is working with TypeScript!",
  },
  Mutation: {
    login: async (_: any, { username, password }: any) => {
      const res = await pool.query<UserRow>('SELECT * FROM users WHERE username = $1', [username]);
      const user = res.rows[0];

      if (!user || user.password !== password) {
        throw new Error('Mali ang username o password!');
      }

      return {
        token: "dummy-jwt-token-for-now",
        user: { 
          id: user.id, 
          username: user.username,
          role: user.role 
        }
      };
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  const { url } = await startStandaloneServer(server, { 
    listen: { port: 4000 } 
  });
  console.log(`🚀 TS Server ready at ${url}`);
}

startServer();