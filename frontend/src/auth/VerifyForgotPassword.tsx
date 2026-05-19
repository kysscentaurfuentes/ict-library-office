import { useEffect, useState } from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  gql,
  useMutation,
} from '@apollo/client';

import {
  useDynamicBackground
} from '../hooks/useDynamicBackground';

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
    ) {

      requestForgotPasswordOTP(
        identifier: $identifier
      ) {
        success
        message
      }
    }
  `;

  export default function VerifyForgotPassword() {
const navigate =
  useNavigate();

const location =
  useLocation();

const currentBackground =
  useDynamicBackground();

const identifier =
  location.state?.identifier;

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
    );

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

  } finally {

    setLoading(false);
  }
};

const handleResend = async () => {

  if (resendCooldown > 0) {
    return;
  }

  try {

    await requestForgotPasswordOTP({
      variables: {
        identifier,
      },
    });

    setSuccessMessage(
      'OTP resent successfully.'
    );

    setResendCooldown(60);

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
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
  }}
>

  {/* BACKGROUND */}
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage:
        currentBackground
          ? `url(${currentBackground})`
          : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >

    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'rgba(0,0,0,0.68)',
      }}
    />

  </div>

  {/* CONTENT */}
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
        maxWidth: '560px',
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
        Enter the 6-digit code
        sent to your CARSU email.
      </p>

      <input
        type="text"
        placeholder="Enter OTP"
        value={code}
        onChange={(e) =>
          setCode(
            e.target.value
          )
        }
        maxLength={6}
        className="auth-input"
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border:
            '1px solid rgba(255,255,255,0.15)',
          background:
            'rgba(255,255,255,0.08)',
          marginBottom: '18px',
          textAlign: 'center',
          letterSpacing: '8px',
          fontSize: '20px',
        }}
      />

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

      <button
        onClick={handleVerify}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          marginBottom: '18px',
        }}
      >
        {loading
          ? 'Verifying...'
          : 'Verify OTP'}
      </button>

      <button
        onClick={handleResend}
        disabled={resendCooldown > 0}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          marginBottom: '14px',
        }}
      >

        {resendCooldown > 0
          ? `Resend OTP in ${resendCooldown}s`
          : 'Resend OTP'}

      </button>

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
</div>
);
  }