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
        // ✅ I-store ang token at ang StudentId na galing sa database
        localStorage.setItem('token', res.data.login.token);
        localStorage.setItem('studentId', res.data.login.user.StudentId);
        
        console.log("Login successful! Student ID saved:", res.data.login.user.StudentId);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)' 
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