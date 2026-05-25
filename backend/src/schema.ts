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

  policy_accepted: Boolean
  policy_version: String
  policy_accepted_at: String
 }

type AuthPayload {
  token: String
  requires2FA: Boolean
  requiresPolicyUpdate: Boolean
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

type ForgotPasswordResponse {
  success: Boolean!
  message: String!
  otpSent: Boolean!
  locked: Boolean
  attempts: Int
  maxAttempts: Int
  remainingSeconds: Int
  captchaRequired: Boolean
}



type ChangePasswordStatus {
  failedAttempts: Int
  lockedUntil: String
}

type ForgotPasswordLockStatus {
  locked: Boolean!
  attempts: Int!
  remainingSeconds: Int!
}

type TwoFactorSetup {
  secret: String
  qrCode: String
  alreadySetup: Boolean
}

type ForgotPasswordOtpStatus {
  failedAttempts: Int!
  locked: Boolean!
  remainingSeconds: Int!
  expiresInSeconds: Int!
}

type AuditLog {
  id: ID
  action: String
  severity: String
  source: String
  target_table: String
  target_id: String
  metadata: String
  ip_address: String
  user_agent: String
  created_at: String
}

type ScanLog {
  id: ID
  student_id: String
  device_id: String
  status: String
  created_at: String
  flag: String
  risk_score: Int
}

 type Query {
  hello: String
  me: User
  routerDevices: [Device]

  checkOtpStatus(
    identifier: String!
  ): OtpStatus

  checkSignupOtpStatus(
    email: String!
  ): OtpStatus

  checkForgotPasswordLock(
    identifier: String!
  ): ForgotPasswordLockStatus

checkForgotPasswordOtpStatus(
  identifier: String!
): ForgotPasswordOtpStatus

  checkChangePasswordStatus: 
  ChangePasswordStatus
  
  pendingUsers: [User]

auditLogs: [AuditLog]

scanLogs: [ScanLog]

  checkSignupAvailability(
    email: String,
    StudentId: String
  ): AvailabilityResponse!
}

type AvailabilityResponse {
  available: Boolean!
  field: String!
}

  type Mutation {

requestForgotPasswordOTP(
  identifier: String!
  captchaToken: String
): ForgotPasswordResponse

verifyForgotPasswordOTP(
  identifier: String!
  code: String!
): Boolean

resetForgotPassword(
  identifier: String!
  code: String!
  newPassword: String!
): Boolean

requestSignupOTP(
  first_name: String!
  middle_name: String
  last_name: String!
  email: String!
  password: String!
  StudentId: String!
  course: String!
  school_id_image: String!

  policyAccepted: Boolean!
  policyVersion: String!
): Boolean

verifySignupOTP(
  email: String!
  code: String!
): Boolean

resendSignupOTP(
  email: String!
): Boolean

changePassword(
  currentPassword: String!
  newPassword: String!
): Boolean

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

      setupTwoFactor: TwoFactorSetup

confirmTwoFactor(
  code: String!
): Boolean

disableTwoFactor(
  password: String!
): Boolean

        approveUser(userId: Int!): Boolean
rejectUser(
  userId: Int!,
  reason: String!
): Boolean

  acceptPolicyUpdate(
  policyVersion: String!
): Boolean
  }
`;