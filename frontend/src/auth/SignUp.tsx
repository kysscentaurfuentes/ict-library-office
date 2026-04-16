// frontend/src/pages/SignUp.tsx
import { gql } from '@apollo/client/core';
import { useMutation } from '@apollo/client/react';
import AuthForm from '../components/AuthForm';

const SIGNUP = gql`
  mutation Signup($username: String!, $password: String!, $StudentId: String!) {
    signup(username: $username, password: $password, StudentId: $StudentId) {
      token
      user {
        username
        StudentId
        role
      }
    }
  }
`;

type SignupResponse = {
  signup: {
    token: string;
    user: {
      username: string;
      StudentId: string;
      role: string;
    };
  };
};

type SignupVariables = {
  username: string;
  password: string;
  StudentId: string;
};

export default function SignUp() {
  const [signup, { loading, error }] = useMutation<SignupResponse, SignupVariables>(SIGNUP);

  const handleSignup = async (username: string, password: string, studentId?: string) => {
    if (!studentId || studentId.length !== 9) return;

    try {
      const res = await signup({
        variables: { username, password, StudentId: studentId },
      });

      if (res.data?.signup.token) {
        localStorage.setItem('token', res.data.signup.token);
        localStorage.setItem('studentId', res.data.signup.user.StudentId);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error("Signup failed:", err);
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
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <AuthForm
        title="Sign Up"
        buttonText="Create Account"
        onSubmit={handleSignup}
        loading={loading}
        error={error?.message}
        mode="signup"
      />
    </div>
  );
}