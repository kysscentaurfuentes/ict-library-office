export const typeDefs = `#graphql

type User {
  id: ID
  first_name: String
  middle_name: String
  last_name: String
  email: String
  StudentId: String
  course: String
  school_id_image: String
  role: String

  suffix: String
  suffix_locked: Boolean
  phone_number: String

  birthdate: String
  age: Int
  gender: String
  nationality: String
  user_classification: String
  student_type: String
  college_department: String
  program: String
  year_level: String
  profile_picture: String
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
  
    login(
      identifier: String!,
      password: String!
    ): AuthPayload

    signup(
  first_name: String!,
  middle_name: String,
  last_name: String!,
  email: String!,
  password: String!,
  StudentId: String!,
  course: String!,
  school_id_image: String
): AuthPayload

updateProfilePicture(
  profile_picture: String!
): User

updateUserInformation(
  phone_number: String!
  suffix: String

  birthdate: String
  age: Int
  gender: String
  nationality: String
  user_classification: String
  student_type: String
  college_department: String
  program: String
  year_level: String
): User

    blockDevice(
      mac: String!
    ): Boolean

    unblockDevice(
      mac: String!
    ): Boolean

    renameDevice(
      mac: String!,
      name: String!
    ): RenameResponse
  }
`;