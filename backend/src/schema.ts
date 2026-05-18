// backend/src/schema.ts
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
  birthdate_locked: Boolean
  age: Int
  gender: String
  gender_locked: Boolean
  nationality: String
  nationality_locked: Boolean
  user_classification: String
  student_type: String
  college_department: String
  program: String
  year_level: String
  profile_picture: String
  vibration_enabled: Boolean
  dark_mode: Boolean
  two_factor_enabled: Boolean
  account_status: String
 }

  type AuthPayload {
    token: String
    requires2FA: Boolean
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

  type OtpStatus {
  failedAttempts: Int
  lockedUntil: String
}

  type Query {
  hello: String
  me: User
  routerDevices: [Device]
  checkOtpStatus(identifier: String!): OtpStatus

  pendingUsers: [User]
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
    course: String
   program: String
   year_level: String
   vibration_enabled: Boolean
   dark_mode: Boolean
   two_factor_enabled: Boolean
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

      verifyTwoFactor(
      identifier: String!
      code: String!
      ): AuthPayload
        approveUser(userId: Int!): Boolean
  rejectUser(userId: Int!): Boolean
  }
`;