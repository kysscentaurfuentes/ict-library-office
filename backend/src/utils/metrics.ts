// ICT-LIBRARY-OFFICE/backend/src/utils/metrics.ts

import client from "prom-client";

export const scanEventsTotal =
  new client.Counter({
    name: "ict_scan_events_total",
    help: "Total scan events",
  });

export const attendanceEventsTotal =
  new client.Counter({
    name: "ict_attendance_events_total",
    help: "Total attendance events",
  });

export const authEventsTotal =
  new client.Counter({
    name: "ict_auth_events_total",
    help: "Total auth events",
  });

export const networkEventsTotal =
  new client.Counter({
    name: "ict_network_events_total",
    help: "Total network events",
  });

export const streamingEventsTotal =
  new client.Counter({
    name: "ict_streaming_events_total",
    help: "Total streaming events",
  });

export const socketEventsTotal =
  new client.Counter({
    name: "ict_socket_events_total",
    help: "Total socket events",
  });

export const uploadEventsTotal =
  new client.Counter({
    name: "ict_upload_events_total",
    help: "Total upload events",
  });

export const graphqlEventsTotal =
  new client.Counter({
    name: "ict_graphql_events_total",
    help: "Total graphql events",
  });

export const errorEventsTotal =
  new client.Counter({
    name: "ict_error_events_total",
    help: "Total error events",
  });

  export const loginSuccessTotal =
  new client.Counter({
    name: "ict_login_success_total",
    help: "Total successful logins",
  });

export const loginFailedTotal =
  new client.Counter({
    name: "ict_login_failed_total",
    help: "Total failed logins",
  });

export const signupRequestsTotal =
  new client.Counter({
    name: "ict_signup_requests_total",
    help: "Total signup requests",
  });

export const passwordResetRequestsTotal =
  new client.Counter({
    name: "ict_password_reset_requests_total",
    help: "Total password reset requests",
  });

export const approvedUsersTotal =
  new client.Counter({
    name: "ict_approved_users_total",
    help: "Total approved users",
  });

export const rejectedUsersTotal =
  new client.Counter({
    name: "ict_rejected_users_total",
    help: "Total rejected users",
  });

export const passwordResetSuccessTotal =
  new client.Counter({
    name: "ict_password_reset_success_total",
    help: "Total successful password resets",
  });
  
export const signupOtpVerifiedTotal =
  new client.Counter({
    name: "ict_signup_otp_verified_total",
    help: "Total verified signup OTPs",
  });

export const twoFactorSuccessTotal =
  new client.Counter({
    name: "ict_2fa_success_total",
    help: "Total successful 2FA logins",
  });

export const twoFactorFailedTotal =
  new client.Counter({
    name: "ict_2fa_failed_total",
    help: "Total failed 2FA attempts",
  });

  export const bruteForceDetectedTotal =
  new client.Counter({
    name: "ict_bruteforce_detected_total",
    help: "Total brute force detections",
  });

export const accountLockoutsTotal =
  new client.Counter({
    name: "ict_account_lockouts_total",
    help: "Total account lockouts",
  });

export const otpLockoutsTotal =
  new client.Counter({
    name: "ict_otp_lockouts_total",
    help: "Total OTP lockouts",
  });

  export const consistencyChecksTotal =
  new client.Counter({
    name: "ict_consistency_checks_total",
    help: "Total consistency checks",
  });

export const consistencyMismatchesTotal =
  new client.Counter({
    name: "ict_consistency_mismatches_total",
    help: "Total consistency mismatches",
  });



export const orphanRecordsTotal =
  new client.Counter({
    name: "ict_orphan_records_total",
    help: "Total orphan records detected",
  });

export const missingChildRecordsTotal =
  new client.Counter({
    name: "ict_missing_child_records_total",
    help: "Total missing child records detected",
  });

  export const syncQueueSize =
  new client.Gauge({
    name: "ict_sync_queue_size",
    help: "Current sync queue size",
  });

  export const syncSuccessTotal =
  new client.Counter({
    name: "ict_sync_success_total",
    help: "Total successful sync operations",
  });

export const syncFailedTotal =
  new client.Counter({
    name: "ict_sync_failed_total",
    help: "Total failed sync operations",
  });