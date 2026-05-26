# ICT LIBRARY OFFICE Database Refactor Progress

## Completed

### user_preferences
Moved:
- dark_mode
- vibration_enabled

### user_2fa
Moved:
- two_factor_enabled
- two_factor_secret
- two_factor_temp_secret
- two_factor_backup_codes
- two_factor_confirmed

### user_security
Moved:
- failed_login_attempts
- login_locked_until
- failed_otp_attempts
- otp_locked_until
- failed_forgot_attempts
- forgot_locked_until
- failed_change_password_attempts
- change_password_locked_until

## Current Status
- Dual-write active
- Read migration partially active
- Old columns NOT yet removed