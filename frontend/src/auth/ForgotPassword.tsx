import { useState } from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  gql,
  useMutation,
} from '@apollo/client';

import {
  useDynamicBackground
} from '../hooks/useDynamicBackground';

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


export default function ForgotPassword() {
const navigate =
  useNavigate();

const currentBackground =
  useDynamicBackground();

const [identifier, setIdentifier] =
  useState('');

const [loading, setLoading] =
  useState(false);

const [errorMessage, setErrorMessage] =
  useState('');

const [successMessage, setSuccessMessage] =
  useState('');

  const [
  requestForgotPasswordOTP
] = useMutation(
  REQUEST_FORGOT_PASSWORD_OTP
);

const handleSubmit = async () => {

  setErrorMessage('');
  setSuccessMessage('');

  if (!identifier.trim()) {

    setErrorMessage(
      'Please enter your Student ID or CARSU email.'
    );

    return;
  }

  try {

    setLoading(true);

    const result =
      await requestForgotPasswordOTP({
        variables: {
          identifier,
        },
      });

    const response =
      result.data
        ?.requestForgotPasswordOTP;

    if (response?.success) {

      setSuccessMessage(
        response.message
      );

      setTimeout(() => {

        navigate(
          '/forgot-password/verify',
          {
            state: {
              identifier,
            },
          }
        );

      }, 1200);
    }

  } catch (error: any) {

    console.error(error);

    setErrorMessage(
      error.message ||
      'Failed to send OTP.'
    );

  } finally {

    setLoading(false);
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
        Forgot Password
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
        Enter your Student ID or
        official CARSU email
        to receive a verification code.
      </p>

      {/* INPUT */}
      <input
        type="text"
        placeholder="Student ID or CARSU Email"
        value={identifier}
        onChange={(e) =>
          setIdentifier(
            e.target.value
          )
        }
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
        }}
      />

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

      {/* BUTTON */}
      <button
        onClick={handleSubmit}
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
          ? 'Sending OTP...'
          : 'Send OTP'}

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
</div>
);
}