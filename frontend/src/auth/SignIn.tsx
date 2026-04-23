// frontend/src/auth/SignIn.tsx
import { gql } from '@apollo/client/core';
import { useMutation } from '@apollo/client/react';
import AuthForm from '../components/AuthForm';

const SIGNIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        username
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
      username: string;
      StudentId: string;
      role: string;
    };
  };
};

type LoginVariables = {
  username: string;
  password: string;
};

export default function SignIn() {
  const [login, { loading, error }] = useMutation<LoginResponse, LoginVariables>(SIGNIN);

  const handleSignin = async (username: string, password: string) => {
    try {
      const res = await login({
        variables: { username, password },
      });

      if (res.data?.login.token) {
        localStorage.setItem('token', res.data.login.token);
        localStorage.setItem('studentId', res.data.login.user.StudentId);
        console.log("Login successful! Student ID saved:", res.data.login.user.StudentId);
        window.location.href = '/homescreen';
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0f172a', // Solid background color
      position: 'fixed',    // Sinisiguro na hindi siya ma-aapektuhan ng ibang layout elements
      top: 0,
      left: 0
    }}>
      <AuthForm
        title="Sign In"
        buttonText="Login"
        onSubmit={handleSignin}
        loading={loading}
        error={error?.message}
        mode="login"
      />
    </div>
  );
}