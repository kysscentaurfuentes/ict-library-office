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

const RESET_FORGOT_PASSWORD =
  gql`
    mutation ResetForgotPassword(
      $identifier: String!
      $code: String!
      $newPassword: String!
    ) {

      resetForgotPassword(
        identifier: $identifier
        code: $code
        newPassword: $newPassword
      )
    }
  `;

  export default function ResetForgotPassword() {
    const navigate =
  useNavigate();

const location =
  useLocation();

const currentBackground =
  useDynamicBackground();

const identifier =
  location.state?.identifier;

const code =
  location.state?.code;

const [newPassword, setNewPassword] =
  useState('');

const [
  confirmPassword,
  setConfirmPassword
] = useState('');

const [loading, setLoading] =
  useState(false);

const [errorMessage, setErrorMessage] =
  useState('');

const [successMessage, setSuccessMessage] =
  useState('');

  useEffect(() => {

  if (!identifier || !code) {

    navigate('/signin');
  }

}, [
  identifier,
  code,
  navigate
]);

const [
  resetForgotPassword
] = useMutation(
  RESET_FORGOT_PASSWORD
);

const handleReset = async () => {

  setErrorMessage('');
  setSuccessMessage('');

  if (
    !newPassword ||
    !confirmPassword
  ) {

    setErrorMessage(
      'Please fill in all fields.'
    );

    return;
  }

  if (
    newPassword !==
    confirmPassword
  ) {

    setErrorMessage(
      'Passwords do not match.'
    );

    return;
  }

  if (
    newPassword.length < 8
  ) {

    setErrorMessage(
      'Password must be at least 8 characters.'
    );

    return;
  }

  try {

    setLoading(true);

    await resetForgotPassword({
      variables: {
        identifier,
        code,
        newPassword,
      },
    });

    setSuccessMessage(
      'Password reset successful.'
    );

    setTimeout(() => {

      navigate('/signin');

    }, 2000);

  } catch (error: any) {

    console.error(error);

    setErrorMessage(
      error.message ||
      'Failed to reset password.'
    );

  } finally {

    setLoading(false);
  }
};

const passwordStrength =
  newPassword.length >= 12
    ? 'Strong'
    : newPassword.length >= 8
    ? 'Medium'
    : 'Weak';

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
        Reset Password
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
        Create a new secure password.
      </p>

      {/* NEW PASSWORD */}
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) =>
          setNewPassword(
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
          marginBottom: '14px',
        }}
      />

      {/* CONFIRM */}
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(
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
          marginBottom: '10px',
        }}
      />

      {/* STRENGTH */}
      <div
        style={{
          marginBottom: '18px',
          fontSize: '14px',
          color:
            passwordStrength === 'Strong'
              ? '#7dffb3'
              : passwordStrength === 'Medium'
              ? '#ffd36b'
              : '#ff7b7b',
        }}
      >
        Password Strength:
        {' '}
        {passwordStrength}
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
        onClick={handleReset}
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
          ? 'Resetting Password...'
          : 'Reset Password'}

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