"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
exports.typeDefs = `#graphql
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
    isBlocked: Boolean
    lastSeen: String
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
    blockDevice(mac: String!): Boolean
    unblockDevice(mac: String!): Boolean
    # 🔥 NEW
    renameDevice(mac: String!, name: String!): RenameResponse
  }
`;
//# sourceMappingURL=schema.js.map