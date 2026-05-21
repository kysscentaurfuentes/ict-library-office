// frontend/src/auth/ForgotPassword.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { Turnstile } from '@marsidev/react-turnstile';

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
  locked
  attempts
  maxAttempts
  remainingSeconds
  captchaRequired
      }
    }
  `;

  const CHECK_FORGOT_LOCK =
  gql`
    query CheckForgotPasswordLock(
      $identifier: String!
    ) {
      checkForgotPasswordLock(
        identifier: $identifier
      ) {
        locked
        attempts
        remainingSeconds
      }
    }
  `;

export default function ForgotPassword() {
  const [
  checkForgotPasswordLock,
  {
    loading: checkingLock
  }
] = useLazyQuery(
  CHECK_FORGOT_LOCK,
  {
    fetchPolicy: 'network-only'
  }
);

const [
  captchaResetKey,
  setCaptchaResetKey
] = useState(0);

const navigate =
  useNavigate();

const [isLocked, setIsLocked] =
  useState(false);

  const [messageColor, setMessageColor] =
  useState('#7dffb3');

  const [attempts, setAttempts] =
  useState(0);

const [lockCountdown, setLockCountdown] =
  useState(0);

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
  showCaptcha,
  setShowCaptcha
] = useState(false);

const [
  captchaVerified,
  setCaptchaVerified
] = useState(false);

const [
  captchaToken,
  setCaptchaToken
] = useState('');

  const [
  requestForgotPasswordOTP
] = useMutation(
  REQUEST_FORGOT_PASSWORD_OTP
);

useEffect(() => {

  const savedIdentifier =
    localStorage.getItem(
      'forgot_identifier'
    );

  if (!savedIdentifier) {


    return;
  }

  setIdentifier(savedIdentifier);

  if (savedIdentifier.includes('@')) {

    setIdentifierType('email');

  } else {

    setIdentifierType('studentId');
  }

  checkForgotPasswordLock({
  variables: {

  identifier:
savedIdentifier.includes('@')
  ? savedIdentifier
  : savedIdentifier,
},
})
.then((result) => {

  const response =
    result.data?.checkForgotPasswordLock;

  if (!response) return;

  setAttempts(
    response.attempts || 0
  );

  setLockCountdown(
    response.remainingSeconds || 0
  );

  setIsLocked(
    response.locked || false
  );

  if (response.locked) {

    setMessageColor('#ff6b6b');

    setSuccessMessage(
      'Too many requests. Try again later.'
    );
  }
})
.catch((error) => {

  console.error(
    'CHECK LOCK ERROR:',
    error
  );
});

}, []);

useEffect(() => {

  console.log(
  'COUNTDOWN EFFECT:',
  {
    lockCountdown,
    isLocked,
    now: new Date().toISOString()
  }
);

  if (lockCountdown <= 0) {

    setIsLocked(false);

    return;
  }

  const timer =
    setInterval(() => {

      setLockCountdown((prev) => {

        if (prev <= 1) {

          clearInterval(timer);

          setIsLocked(false);

          return 0;
        }

        return prev - 1;
      });

    }, 1000);

     console.log(
    'LOCK STATE CHANGED:',
    {
      isLocked,
      lockCountdown,
      attempts
    }
  );
  return () => clearInterval(timer);

}, [
  isLocked,
  lockCountdown,
  attempts
]);

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

const formatCountdown = (
  totalSeconds: number
) => {
console.log(
  'FORMAT COUNTDOWN INPUT:',
  totalSeconds
);
  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

return `${minutes
  .toString()
  .padStart(2, '0')} minutes ${seconds
  .toString()
  .padStart(2, '0')} seconds`;
};

const handleSubmit = async () => {



  setErrorMessage('');
  setSuccessMessage('');

  if (
  showCaptcha &&
  !captchaVerified
) {

  setErrorMessage(
    'Please complete CAPTCHA verification.'
  );

  return;
}

  if (!identifier.trim()) {

    setErrorMessage(
      'Please enter your Student ID or CARSU email.'
    );

    return;
  }  localStorage.setItem(
  'forgot_identifier',
  identifierType === 'email'
    ? `${identifier}@carsu.edu.ph`
    : identifier
);

  try {

    setLoading(true);

    const result =
      await requestForgotPasswordOTP({
     variables: {

  identifier:
    identifierType === 'email'
      ? `${identifier}@carsu.edu.ph`
      : identifier,

  captchaToken,
},
      });

    const response =
      result.data
        ?.requestForgotPasswordOTP;
console.log(
  'FULL RESPONSE:',
  JSON.stringify(response, null, 2)
);
        console.log(
  'FORGOT PASSWORD RESPONSE:',
  response
);

console.log(
  'remainingSeconds TYPE:',
  typeof response?.remainingSeconds
);

console.log(
  'remainingSeconds VALUE:',
  response?.remainingSeconds
);

console.log(
  'IS NaN:',
  isNaN(response?.remainingSeconds)
);

    if (response?.success) {
setSuccessMessage(
  response.message
);

setShowCaptcha(
  response?.captchaRequired || false
);

setAttempts(
  Number(response?.attempts) || 0
);

setLockCountdown(
  Number(response?.remainingSeconds) || 0
);

if (response?.locked) {

  setMessageColor('#ff6b6b');

} else {

  setMessageColor('#7dffb3');
}

  // LOCKED RESPONSE
if (response?.locked) {

  setIsLocked(true);

  return;
}

  if (response?.otpSent) {
    setCaptchaVerified(false);
setCaptchaToken('');
setShowCaptcha(false);
setCaptchaResetKey(prev => prev + 1);
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
    
    setCaptchaVerified(false);
setCaptchaToken('');
setCaptchaResetKey(prev => prev + 1);

    console.error(error);

    setErrorMessage(
      error.message ||
      'Failed to send OTP.'
    );

  } finally {

    setLoading(false);
  }
};

const attemptColor =

  attempts === 0
    ? '#22c55e'

  : attempts === 1
    ? '#3b82f6'

  : attempts === 2
    ? '#facc15'

  : attempts === 3
    ? '#fb923c'

  : attempts === 4
    ? '#ef4444'

  : '#a855f7';

  const attemptGlow = `
0 0 12px ${attemptColor},
0 0 22px ${attemptColor}55
`;

 return (
  <div
    style={{
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
        color: 'white',
        fontFamily:
          '"Poppins", "Segoe UI", sans-serif',
      }}
    >

      {/* HEADER */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '34px',
        }}
      >

        <h2
          style={{
            color: '#ffffff',
            fontSize: '2rem',
            fontWeight: 600,
            letterSpacing: '10px',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          ICT LIBRARY OFFICE
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '8px',
          }}
        >

          <div
            style={{
              width: '60px',
              height: '2px',
              background: '#8b5cf6',
              borderRadius: '20px',
            }}
          />

          <h1
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '2rem',
              fontWeight: 600,
              letterSpacing: '3px',
            }}
          >
            ACCOUNT RECOVERY
          </h1>

          <div
            style={{
              width: '60px',
              height: '2px',
              background: '#8b5cf6',
              borderRadius: '20px',
            }}
          />

        </div>

      </div>

      {/* GLASS CARD */}
      <div
        style={{
          backdropFilter: 'blur(18px)',
          background:
            'rgba(255,255,255,0.11)',
          border:
            '1px solid rgba(255,255,255,0.12)',
          borderRadius: '18px',
          padding: '38px 36px 30px',
          boxShadow:
            '0 10px 35px rgba(0,0,0,0.32), 0 0 12px rgba(255,255,255,0.06)',
        }}
      >

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

          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: 'white',
            }}
          >
            Student ID or CARSU Account:
          </label>

          <input
            type="text"
            placeholder="Student ID or CARSU Account"
            value={identifier}
            onChange={handleIdentifierChange}
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

          {identifierType === 'email' && (
            <span
              style={{
                position: 'absolute',
                right: '14px',
                top: '73%',
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
              color: messageColor,
              textAlign: 'center',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* SECURITY STATUS */}
<div
  style={{
    marginBottom: '18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  }}
>

  {/* ATTEMPTS */}
  <div
    style={{
      color: attemptColor,
      fontWeight: 700,
      fontSize: '0.95rem',
      letterSpacing: '0.5px',

      textShadow: attemptGlow,

      transition: 'all 0.25s ease',
    }}
  >
    Attempts:
    {' '}
    {attempts}/5
  </div>

  {/* PROGRESS BAR */}
  <div
    style={{
      width: '100%',
      height: '8px',
      borderRadius: '999px',
      background:
        'rgba(255,255,255,0.08)',
      overflow: 'hidden',
    }}
  >

    <div
      style={{
        width: `${(attempts / 5) * 100}%`,
        height: '100%',

        background: attemptColor,

        boxShadow: attemptGlow,

        transition:
          'all 0.25s ease',
      }}
    />

  </div>

  {/* LOCK TIMER */}
  {isLocked && (

    <div
      style={{
        color: '#c4b5fd',
        fontWeight: 700,
        fontSize: '0.92rem',
        textAlign: 'center',

        textShadow:
          '0 0 12px rgba(168,85,247,0.55)',
      }}
    >
      Try again in
      {' '}
      {formatCountdown(lockCountdown)}
    </div>

  )}

</div>

 {/* =========================
DEBUG CAPTCHA
REPLACEABLE WITH
PRODUCTION TURNSTILE
========================= */}

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

  console.log(
    'TURNSTILE TOKEN:',
    token
  );

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
        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={
  loading ||
  isLocked ||
  checkingLock
}
         style={{
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: 'none',

  cursor:
    loading || isLocked
      ? 'not-allowed'
      : 'pointer',

  opacity:
    loading || isLocked
      ? 0.6
      : 1,

  fontWeight: 700,
  marginBottom: '18px',

  background:
    'linear-gradient(90deg,#6366f1,#8b5cf6)',

  color: 'white',
}}
        >
          {checkingLock
  ? 'Checking Security...'
  : loading
    ? 'Sending OTP...'
    : isLocked
      ? 'Temporarily Locked'
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