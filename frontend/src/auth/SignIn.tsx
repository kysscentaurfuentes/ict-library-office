// frontend/src/auth/SignIn.tsx
import { gql } from '@apollo/client/core';
import { useMutation } from '@apollo/client/react';
import { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import { useDynamicBackground } from '../hooks/useDynamicBackground'; // IMPORTANTE: I-import ang hook

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
    };
  };
};

type LoginVariables = {
  identifier: string;
  password: string;
};

export default function SignIn() {
  const [login, { loading, error }] = useMutation<LoginResponse, LoginVariables>(SIGNIN);
  const currentBackground = useDynamicBackground(); // GAMITIN ANG HOOK

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
    const res = await login({
      variables: {
        identifier: identifier || '',
        password,
      },
    });

    if (res.data?.login.token) {
      localStorage.setItem(
        'token',
        res.data.login.token
      );

      localStorage.setItem(
        'studentId',
        res.data.login.user.StudentId
      );

      localStorage.setItem(
        'role',
        res.data.login.user.role
      );

      localStorage.setItem(
       'user',
      JSON.stringify(res.data.login.user)
      );

      console.log(
        'Login successful! Student ID saved:',
        res.data.login.user.StudentId
      );

      window.location.hash =
        '#/homescreen';
    }
  } catch (err) {
    console.error(
      'Login failed:',
      err
    );
  }
};

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      {/* Background Image Container with Dark Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        />
      </div>

      {/* Glass/Blur Container */}
      <div
  style={{
    position: 'relative',
    zIndex: 10,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  }}
>
  <AuthForm
    title="SIGN IN"
    buttonText="Login"
    onSubmit={handleSignin}
    loading={loading}
    error={error?.message}
    mode="login"
  />
</div>
    </div>
  );
}