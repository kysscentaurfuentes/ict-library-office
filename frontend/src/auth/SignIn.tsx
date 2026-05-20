// frontend/src/auth/SignIn.tsx
import { gql } from '@apollo/client/core';
import { useMutation } from '@apollo/client/react';
import { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';



const SIGNIN = gql`
  mutation Login($identifier: String!, $password: String!) {
  login(identifier: $identifier, password: $password) {
    token
    user {
      first_name
      middle_name
      last_name
      email
      StudentId
      role
      profile_picture
      vibration_enabled
      dark_mode
      two_factor_enabled
    }
  }
}
`;

type LoginResponse = {
  login: {
    token: string;
    user: {
      first_name: string;
      middle_name: string;
      last_name: string;
      email: string;
      StudentId: string;
      role: string;
      profile_picture: string;
      vibration_enabled: boolean;
      dark_mode: boolean;
      two_factor_enabled?: boolean;
    };
  };
};

type LoginVariables = {
  identifier: string;
  password: string;
};

const LOCK_ERROR =
  'Sign-in temporarily disabled due to too many failed attempts. Please try again shortly.';

export default function SignIn() {
  const [login, { loading, error }] = useMutation<LoginResponse, LoginVariables>(SIGNIN);

  const [lockMessage, setLockMessage] = useState('');
const savedLockUntil =
  Number(localStorage.getItem('loginLockUntil')) || 0;

const remaining =
  Math.max(
    0,
    Math.floor((savedLockUntil - Date.now()) / 1000)
  );

const [isLocked, setIsLocked] =
  useState(remaining > 0);

const [lockCountdown, setLockCountdown] =
  useState(remaining);

useEffect(() => {
  if (isLocked) {
    setLockMessage(LOCK_ERROR);
  }
}, [isLocked]);

  useEffect(() => {
  let timer: ReturnType<typeof setInterval>;

  if (isLocked && lockCountdown > 0) {
    timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem('loginLockUntil');
          setIsLocked(false);
          setLockMessage('');
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }

  return () => {
    if (timer) {
      clearInterval(timer);
    }
  };
}, [isLocked, lockCountdown]);

const handleSignin = async (
  _firstName: string,
  _middleName: string,
  _lastName: string,
  _email: string,
  password: string,
  _course: string,
  _studentId: string,
  _schoolIdImage: File,
  identifier?: string
) => {

  console.log("IDENTIFIER:", identifier);
  console.log("STUDENT ID:", _studentId);

  try {
    // ✅ SINGLE REQUEST ONLY
    const res = await login({
      variables: {
        identifier: identifier || '',
        password,
      },
    });

    // safety check
    const result = res.data?.login;

    if (!result) {
      console.error("No login response");
      return;
    }

    // 🔐 2FA FLOW
if (result.user?.two_factor_enabled && !result.token) {
  localStorage.setItem(
    'pendingIdentifier',
    identifier || ''
  );

  localStorage.setItem(
    'pendingEmail',
    result.user.email || ''
  );

  window.location.hash = '#/two-factor';
  return;
}

    // ❌ invalid login safety
    if (!result.token) {
      console.error("No token returned");
      return;
    }

    // ✅ SAVE TO LOCAL STORAGE
    localStorage.setItem('token', result.token);

    localStorage.setItem(
      'studentId',
      result.user.StudentId || ''
    );

    localStorage.setItem(
      'role',
      result.user.role || ''
    );

    localStorage.setItem(
      'userName',
      result.user.first_name || ''
    );

    localStorage.setItem(
      'user',
      JSON.stringify(result.user)
    );

    localStorage.setItem(
      'vibrationEnabled',
      JSON.stringify(result.user.vibration_enabled)
    );

    localStorage.setItem(
      'darkMode',
      JSON.stringify(result.user.dark_mode)
    );

    console.log(
      'Login successful! Student ID saved:',
      result.user.StudentId
    );
    localStorage.removeItem('savedIdentifier');
    window.location.hash = '#/homescreen';

  } catch (err: any) {
  console.error('Login failed:', err);

  const message =
    err?.message || '';
    const errorCode =
  err?.graphQLErrors?.[0]
    ?.extensions?.code;

if (
  errorCode ===
  "ACCOUNT_PENDING"
) {

  const pendingEmail =
    err?.graphQLErrors?.[0]
      ?.extensions?.email || '';

  const pendingStudentId =
    err?.graphQLErrors?.[0]
      ?.extensions?.studentId || '';

  localStorage.setItem(
    'pendingEmail',
    pendingEmail
  );

  localStorage.setItem(
    'pendingIdentifier',
    pendingStudentId
  );

  window.location.hash =
    "#/pending-approval";

  return;
}

if (
  errorCode ===
  "ACCOUNT_REJECTED"
) {

  const rejectedEmail =
    err?.graphQLErrors?.[0]
      ?.extensions?.email || '';

  const rejectedStudentId =
    err?.graphQLErrors?.[0]
      ?.extensions?.studentId || '';

  localStorage.setItem(
    'rejectedEmail',
    rejectedEmail
  );

  localStorage.setItem(
    'rejectedStudentId',
    rejectedStudentId
  );

  window.location.hash =
    '#/rejected-approval';

  return;
}
  if (
  message.includes(
    'Too many login attempts'
  )
) {
  const lockUntil =
  Date.now() + 60000;

localStorage.setItem(
  'loginLockUntil',
  String(lockUntil)
);

setIsLocked(true);
setLockCountdown(60);// 60 seconds

setLockMessage(LOCK_ERROR);
}
}
};

  return (


    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <AuthForm
          title="SIGN IN"
          buttonText="Login"
          onSubmit={handleSignin}
          loading={loading}
          isLocked={isLocked}
          lockCountdown={lockCountdown}
          error={lockMessage || error?.message}
          mode="login"
        />
      </div>
    </div>


);
}