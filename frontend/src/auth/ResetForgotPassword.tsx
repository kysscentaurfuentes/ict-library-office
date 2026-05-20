// frontend/src/auth/ResetForgotPassword.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { useDynamicBackground } from '../hooks/useDynamicBackground';

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

  const [
  passwordStrength,
  setPasswordStrength
] = useState<
  '' |
  'weak' |
  'medium' |
  'strong' |
  'excellent'
>('');

const [
  passwordChecks,
  setPasswordChecks
] = useState({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false,
});

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

const evaluatePasswordStrength = (
  value: string
) => {

  const checks = {
    length: value.length >= 8,

    uppercase:
      /[A-Z]/.test(value),

    lowercase:
      /[a-z]/.test(value),

    number:
      /[0-9]/.test(value),

    special:
      /[!@#$%^&*(),.?":{}|<>]/.test(value),
  };

  setPasswordChecks(checks);

  if (!value.trim()) {
    setPasswordStrength('');
    return;
  }

  let passedConditions = 0;

  if (checks.length) {
    passedConditions++;
  }

  if (
    checks.uppercase &&
    checks.lowercase
  ) {
    passedConditions++;
  }

  if (checks.number) {
    passedConditions++;
  }

  if (checks.special) {
    passedConditions++;
  }

  if (passedConditions === 1) {
    setPasswordStrength('weak');
  }

  else if (passedConditions === 2) {
    setPasswordStrength('medium');
  }

  else if (passedConditions === 3) {
    setPasswordStrength('strong');
  }

  else if (passedConditions === 4) {
    setPasswordStrength('excellent');
  }
};

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
<div
  style={{
    marginBottom: '16px',
  }}
>

  <label
    style={{
      display: 'block',
      marginBottom: '8px',
      fontWeight: 600,
      color: 'white',
    }}
  >
    New Password
  </label>

  <input
    type="password"
    placeholder="Enter new password"
    value={newPassword}
    onChange={(e) => {

      const value =
        e.target.value;

      setNewPassword(value);

      evaluatePasswordStrength(
        value
      );
    }}
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
    }}
  />

  {/* PASSWORD CHECKS */}
  <div
    style={{
      marginTop: '10px',
      display: 'grid',
      gridTemplateColumns:
        '1fr 1fr',
      gap: '6px',
      fontSize: '0.78rem',
      fontWeight: 600,
    }}
  >

    <span
      style={{
        color:
          passwordChecks.length
            ? '#7dffb3'
            : '#ff8b8b',
      }}
    >
      {passwordChecks.length
        ? '✓'
        : '✗'} 8+ characters
    </span>

    <span
      style={{
        color:
          passwordChecks.uppercase &&
          passwordChecks.lowercase
            ? '#7dffb3'
            : '#ff8b8b',
      }}
    >
      {passwordChecks.uppercase &&
      passwordChecks.lowercase
        ? '✓'
        : '✗'} Uppercase & lowercase
    </span>

    <span
      style={{
        color:
          passwordChecks.number
            ? '#7dffb3'
            : '#ff8b8b',
      }}
    >
      {passwordChecks.number
        ? '✓'
        : '✗'} 1 number
    </span>

    <span
      style={{
        color:
          passwordChecks.special
            ? '#7dffb3'
            : '#ff8b8b',
      }}
    >
      {passwordChecks.special
        ? '✓'
        : '✗'} Special character
    </span>

  </div>
</div>

      {/* CONFIRM PASSWORD */}
<div
  style={{
    marginBottom: '18px',
  }}
>

  <label
    style={{
      display: 'block',
      marginBottom: '8px',
      fontWeight: 600,
      color: 'white',
    }}
  >
    Confirm Password
  </label>

  <input
    type="password"
    placeholder="Confirm password"
    value={confirmPassword}
    onChange={(e) =>
      setConfirmPassword(
        e.target.value
      )
    }
    className="auth-input"
    style={{
      width: '100%',
      boxSizing: 'border-box',
      padding: '14px',
      borderRadius: '12px',
      border:
        confirmPassword &&
        newPassword !==
          confirmPassword
          ? '1px solid #ff7b7b'
          : '1px solid rgba(255,255,255,0.15)',

      background:
        'rgba(255,255,255,0.08)',

      color: 'white',
    }}
  />

  {confirmPassword &&
    newPassword !==
      confirmPassword && (

    <div
      style={{
        marginTop: '8px',
        color: '#ff7b7b',
        fontSize: '0.82rem',
      }}
    >
      Passwords do not match.
    </div>

  )}

  {confirmPassword &&
    newPassword ===
      confirmPassword && (

    <div
      style={{
        marginTop: '8px',
        color: '#7dffb3',
        fontSize: '0.82rem',
      }}
    >
      ✓ Passwords match
    </div>

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
        onClick={handleReset}
        disabled={
  loading ||
  passwordStrength !==
    'excellent' ||
  !newPassword ||
  !confirmPassword ||
  newPassword !==
    confirmPassword
}
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