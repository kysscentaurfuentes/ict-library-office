// frontend/src/auth/ForgotPassword.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';



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
        otpSent
      }
    }
  `;


export default function ForgotPassword() {
const navigate =
  useNavigate();



const [identifier, setIdentifier] =
  useState('');

const [identifierType, setIdentifierType] =
  useState<
    'studentId' |
    'email' |
    ''
  >('');

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

const handleIdentifierChange = (
  e: React.ChangeEvent<HTMLInputElement>
): void => {

  let value = e.target.value;

  // EMPTY
  if (!value.trim()) {
    setIdentifier('');
    setIdentifierType('');
    return;
  }

  // LOCK completed student ID
  if (
    /^\d{3}-\d{5}$/.test(identifier) &&
    value.length > identifier.length
  ) {
    return;
  }

  // HAS DASH = STUDENT ID MODE
  const hasDash =
    identifier.includes('-') ||
    value.includes('-');

  if (hasDash) {

    let digits =
      value.replace(/\D/g, '');

    if (digits.length > 8) {
      digits = digits.slice(0, 8);
    }

    if (digits.length > 3) {
      digits =
        digits.slice(0, 3) +
        '-' +
        digits.slice(3);
    }

    setIdentifier(digits);
    setIdentifierType('studentId');

    return;
  }

  // STARTS WITH NUMBER = STUDENT ID
  if (/^\d/.test(value)) {

    let digits =
      value.replace(/\D/g, '');

    if (digits.length > 8) {
      digits = digits.slice(0, 8);
    }

    if (digits.length > 3) {
      digits =
        digits.slice(0, 3) +
        '-' +
        digits.slice(3);
    }

    setIdentifier(digits);

    if (digits.length >= 1) {
      setIdentifierType('studentId');
    } else {
      setIdentifierType('');
    }

    return;
  }

  // EMAIL MODE
  const cleaned =
    value

      // remove spaces
      .replace(/\s/g, '')

      // remove @ and everything after
      .replace(/@.*/g, '')

      // allow only valid email username chars
      .replace(
        /[^a-zA-Z0-9._-]/g,
        ''
      )

      // no multiple dots
      .replace(/\.{2,}/g, '.')

      // no starting dot
      .replace(/^\./, '')

      // no multiple underscores
      .replace(/_{2,}/g, '_')

      // no multiple hyphens
      .replace(/-{2,}/g, '-');

  setIdentifier(cleaned);

  if (cleaned.length >= 1) {
    setIdentifierType('email');
  } else {
    setIdentifierType('');
  }
};

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
          identifier:
  identifierType === 'email'
    ? `${identifier}@carsu.edu.ph`
    : identifier,
        },
      });

    const response =
      result.data
        ?.requestForgotPasswordOTP;

    if (response?.success) {

  setSuccessMessage(
    response.message
  );

  if (response?.otpSent) {

    setTimeout(() => {

      navigate(
        '/forgot-password/verify',
        {
          state: {
            identifier:
              identifierType === 'email'
                ? `${identifier}@carsu.edu.ph`
                : identifier,
          },
        }
      );

    }, 1200);
  }
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
      <div
        style={{
          position: 'relative',
          marginBottom: '18px',
        }}
      >

        <input
          type="text"
          placeholder="Student ID or CARSU Account"
          value={identifier}
          onChange={
            handleIdentifierChange
          }
          className="auth-input"
          style={{
            width: '100%',
            height: '52px',
            boxSizing: 'border-box',
            padding: '0 16px',
            paddingRight:
              identifierType === 'email'
                ? '150px'
                : '16px',
            borderRadius: '12px',
            border:
              '1px solid rgba(255,255,255,0.15)',
            background:
              'rgba(255,255,255,0.08)',
            color: '#ffffff',
          }}
        />

        {identifierType ===
          'email' && (
          <span
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform:
                'translateY(-50%)',
              color:
                'rgba(255,255,255,0.55)',
              fontWeight: 600,
              pointerEvents: 'none',
            }}
          >
            @carsu.edu.ph
          </span>
        )}

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
);
}