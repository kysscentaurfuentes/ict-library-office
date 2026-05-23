// frontend/src/auth/VerifyForgotPasswordOTP.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useMutation, useLazyQuery } from '@apollo/client';

import { Turnstile }
from '@marsidev/react-turnstile';

const VERIFY_FORGOT_PASSWORD_OTP =
  gql`
    mutation VerifyForgotPasswordOTP(
      $identifier: String!
      $code: String!
    ) {

      verifyForgotPasswordOTP(
        identifier: $identifier
        code: $code
      )
    }
  `;

const REQUEST_FORGOT_PASSWORD_OTP =
  gql`
    mutation RequestForgotPasswordOTP(
  $identifier: String!
  $captchaToken: String
) {

      requestForgotPasswordOTP(
  identifier: $identifier
  captchaToken: $captchaToken
) {
       success
message
otpSent
captchaRequired
attempts
maxAttempts
remainingSeconds
locked
      }
    }
  `;

  const CHECK_FORGOT_PASSWORD_OTP_STATUS =
  gql`
    query CheckForgotPasswordOtpStatus(
      $identifier: String!
    ) {

      checkForgotPasswordOtpStatus(
        identifier: $identifier
      ) {
        failedAttempts
        locked
        remainingSeconds
        expiresInSeconds
      }
    }
  `;

  export default function VerifyForgotPassword() {
const navigate =
  useNavigate();

const location =
  useLocation();

const identifier =
  location.state?.identifier ||
  localStorage.getItem(
    'forgot_identifier'
  );

  const [otpCountdown, setOtpCountdown] =
  useState(300);

  const [verifyAttempts, setVerifyAttempts] =
  useState(0);

  const [verifyLocked, setVerifyLocked] =
  useState(false);

const [verifyLockCountdown,
setVerifyLockCountdown] =
  useState(0);

  const [showCaptcha, setShowCaptcha] =
  useState(false);

const [captchaVerified,
setCaptchaVerified] =
  useState(false);

const [captchaToken,
setCaptchaToken] =
  useState('');

  const [
  captchaResetKey,
  setCaptchaResetKey
] = useState(0);

const [code, setCode] =
  useState('');

const [loading, setLoading] =
  useState(false);

const [errorMessage, setErrorMessage] =
  useState('');

const [successMessage, setSuccessMessage] =
  useState('');

const [resendCooldown, setResendCooldown] =
  useState(60);

  useEffect(() => {

  if (!identifier) {
    navigate('/signin');
  }

}, [identifier, navigate]);

useEffect(() => {

  if (resendCooldown <= 0) {
    return;
  }

  const timer =
    setInterval(() => {

      setResendCooldown(
        (prev) => prev - 1
      );

    }, 1000);

  return () =>
    clearInterval(timer);

}, [resendCooldown]);

useEffect(() => {

  if (otpCountdown <= 0) {
    return;
  }

  const timer =
    setInterval(() => {

      setOtpCountdown(
        (prev) => prev - 1
      );

    }, 1000);

  return () =>
    clearInterval(timer);

}, [otpCountdown]);

useEffect(() => {

  if (
    verifyLockCountdown <= 0
  ) {

    setVerifyLocked(false);

    return;
  }

  const timer =
    setInterval(() => {

      setVerifyLockCountdown(
        (prev) => {

          if (prev <= 1) {

            clearInterval(timer);

            setVerifyLocked(false);

            return 0;
          }

          return prev - 1;
        }
      );

    }, 1000);

  return () =>
    clearInterval(timer);

}, [verifyLockCountdown]);

useEffect(() => {

  if (!identifier) {
    return;
  }

  checkForgotPasswordOtpStatus({
    variables: {
      identifier
    }
  })
  .then((result) => {

    const response =
      result.data
      ?.checkForgotPasswordOtpStatus;

    if (!response) {
      return;
    }

    setVerifyAttempts(
      response.failedAttempts || 0
    );

    setVerifyLocked(
      response.locked || false
    );

    setVerifyLockCountdown(
      response.remainingSeconds || 0
    );

    setOtpCountdown(
      response.expiresInSeconds || 0
    );
  })
  .catch(console.error);

}, [identifier]);

const [
  verifyForgotPasswordOTP
] = useMutation(
  VERIFY_FORGOT_PASSWORD_OTP
);

const [
  requestForgotPasswordOTP
] = useMutation(
  REQUEST_FORGOT_PASSWORD_OTP
);

const [
  checkForgotPasswordOtpStatus
] = useLazyQuery(
  CHECK_FORGOT_PASSWORD_OTP_STATUS,
  {
    fetchPolicy: 'network-only'
  }
);

const formatCountdown = (
  totalSeconds: number
) => {

  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  return `${minutes
    .toString()
    .padStart(2, '0')}m ${seconds
    .toString()
    .padStart(2, '0')}s`;
};

const maskEmail = (
  email: string
) => {

  if (!email.includes('@')) {
    return email;
  }

  const [name, domain] =
    email.split('@');

  return (
    name.slice(0, 3) +
    '*****@' +
    domain
  );
};

const otpExpired =
  otpCountdown <= 0;

const handleVerify = async () => {

  setErrorMessage('');
  setSuccessMessage('');

  if (code.length !== 6) {

    setErrorMessage(
      'OTP must be 6 digits.'
    );

    return;
  }

  try {

    setLoading(true);

    await verifyForgotPasswordOTP({
      variables: {
        identifier,
        code,
      },
    });

    setSuccessMessage(
      'OTP verified successfully.'
    ); setCode('');

    setTimeout(() => {

      navigate(
        '/forgot-password/reset',
        {
          state: {
            identifier,
            code,
          },
        }
      );

    }, 1200);

  } catch (error: any) {

    console.error(error);

    setErrorMessage(
      error.message ||
      'Invalid OTP.'
    );

    setVerifyAttempts(
  (prev) => prev + 1
);

  } finally {

    setLoading(false);
  }
};

const handleResend = async () => {

  if (resendCooldown > 0) {
    return;
  }

  if (
    showCaptcha &&
    !captchaVerified
  ) {

    setErrorMessage(
      'Please complete CAPTCHA verification.'
    );

    return;
  }

  try {

    setErrorMessage('');
    setSuccessMessage('');

    const result =
      await requestForgotPasswordOTP({
        variables: {
          identifier,
          captchaToken,
        },
      });

    const response =
      result.data
      ?.requestForgotPasswordOTP;

    setShowCaptcha(
      response?.captchaRequired || false
    );

    setCaptchaVerified(false);

    setCaptchaToken('');

    setCaptchaResetKey(
      (prev) => prev + 1
    );

    if (response?.otpSent) {

      setSuccessMessage(
        'OTP resent successfully.'
      );

      setOtpCountdown(300);

      setResendCooldown(60);
    }

  } catch (error: any) {

    console.error(error);

    setErrorMessage(
      error.message ||
      'Failed to resend OTP.'
    );
  }
};
return (
  <div
    style={{
      position: 'relative',
      zIndex: 5,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    }}
  >

    <div
      style={{
        width: '100%',
        maxWidth: '520px',
        backdropFilter: 'blur(18px)',
        background:
          'rgba(255,255,255,0.10)',
        border:
          '1px solid rgba(255,255,255,0.12)',
        borderRadius: '20px',
        padding: '38px',
        color: 'white',
      }}
    >

      <h1
        style={{
          textAlign: 'center',
          marginBottom: '12px',
        }}
      >
        Verify OTP
      </h1>

      <p
        style={{
          textAlign: 'center',
          color:
            'rgba(255,255,255,0.72)',
          marginBottom: '28px',
          lineHeight: 1.6,
        }}
      >
        A recovery code was sent to your verified email.
        Code sent to:
{' '}
{maskEmail(identifier)}
      </p>

      <div
  style={{
    marginBottom: '18px',
    textAlign: 'center',
    color:
      otpExpired
        ? '#ff7b7b'
        : '#c4b5fd',
    fontWeight: 700,
  }}
>
  {otpExpired
    ? 'OTP expired.'
    : `OTP expires in ${formatCountdown(otpCountdown)}`}
</div>

      {/* OTP INPUT */}
      <div
        style={{
          marginBottom: '18px',
        }}
      >

        <div
  style={{
    marginBottom: '18px',
    textAlign: 'center',
    color: '#facc15',
    fontWeight: 700,
  }}
>
  Attempts:
  {' '}
  {verifyAttempts}/5
</div>

{verifyLocked && (

  <div
    style={{
      marginBottom: '18px',
      textAlign: 'center',
      color: '#ff7b7b',
      fontWeight: 700,
    }}
  >
    Try again in
    {' '}
    {formatCountdown(
      verifyLockCountdown
    )}
  </div>

)}

{showCaptcha && (

  <div
    style={{
      marginBottom: '18px',
      display: 'flex',
      justifyContent: 'center',
    }}
  >

    <Turnstile
      key={captchaResetKey}

      siteKey={
        import.meta.env
          .VITE_TURNSTILE_SITE_KEY
      }

      onSuccess={(token) => {

        setCaptchaVerified(true);

        setCaptchaToken(token);
      }}

      onError={() => {

        setCaptchaVerified(false);

        setCaptchaToken('');

        setErrorMessage(
          'CAPTCHA verification failed.'
        );
      }}

      onExpire={() => {

        setCaptchaVerified(false);

        setCaptchaToken('');
      }}
    />

  </div>

)}

        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
          }}
        >
          OTP Code
        </label>

        <input
          type="text"
          disabled={
  loading ||
  verifyLocked ||
  otpExpired
}

autoFocus

onKeyDown={(e) => {

  if (e.key === 'Enter') {
    handleVerify();
  }
}}
          maxLength={6}
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value
                .replace(/\D/g, '')
            )
          }
          placeholder="Enter 6-digit OTP"
          className="auth-input"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '14px',
            borderRadius: '12px',
            border:
              '1px solid rgba(255,255,255,0.15)',
            background:
              'rgba(255,255,255,0.08)',
            color: 'white',
            fontSize: '1rem',
            textAlign: 'center',
            letterSpacing: '4px',
          }}
        />

      </div>

      {/* ERROR */}
      {errorMessage && (

        <div
          style={{
            marginBottom: '16px',
            color: '#ff7b7b',
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </div>

      )}

      {/* SUCCESS */}
      {successMessage && (

        <div
          style={{
            marginBottom: '16px',
            color: '#7dffb3',
            textAlign: 'center',
          }}
        >
          {successMessage}
        </div>

      )}

      {/* VERIFY BUTTON */}
      <button
        onClick={handleVerify}
        disabled={
  loading ||
  verifyLocked ||
  otpExpired
}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          cursor:
  loading ||
  verifyLocked ||
  otpExpired
    ? 'not-allowed'
    : 'pointer',

opacity:
  loading ||
  verifyLocked ||
  otpExpired
    ? 0.6
    : 1,
          fontWeight: 700,
          marginBottom: '16px',
        }}
      >

        {loading
  ? 'Verifying OTP...'
  : verifyLocked
    ? 'Temporarily Locked'
    : otpExpired
      ? 'OTP Expired'
      : 'Verify OTP'}

      </button>

      {/* RESEND */}
      <button
        onClick={handleResend}
        disabled={
  resendCooldown > 0 ||
  loading
}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '12px',
          border:
            '1px solid rgba(255,255,255,0.15)',
          background: 'transparent',
          color: 'white',
          cursor:
  resendCooldown > 0 ||
  loading
    ? 'not-allowed'
    : 'pointer',

opacity:
  resendCooldown > 0 ||
  loading
    ? 0.6
    : 1,
          marginBottom: '16px',
        }}
      >

        {resendCooldown > 0
          ? `Resend OTP in ${resendCooldown}s`
          : 'Resend OTP'}

      </button>

      {/* BACK */}
      <button
        onClick={() =>
          navigate('/signin')
        }
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        ← Back to Sign In
      </button>

    </div>

  </div>
);
  }