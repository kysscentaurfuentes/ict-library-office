// backend/src/schema.ts

export const typeDefs = `#graphql
  type User {
    id: ID
    username: String
    StudentId: String
    role: String
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Device {
    ip: String
    mac: String
    name: String
    isAlive: Boolean
  }

  type RenameResponse {
    success: Boolean
  }

  type Query {
    hello: String
    me: User
    routerDevices: [Device]
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    signup(username: String!, password: String!, StudentId: String!): AuthPayload

    # 🔥 NEW
    renameDevice(mac: String!, name: String!): RenameResponse
  }
`;