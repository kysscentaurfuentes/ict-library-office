// frontend/src/components/AuthForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  title: string;
  buttonText: string;
  onSubmit: (username: string, password: string, studentId?: string) => void;
  loading?: boolean;
  error?: string;
  mode?: 'login' | 'signup';
};

export default function AuthForm({
  title,
  buttonText,
  onSubmit,
  loading,
  error: backendError,
  mode = 'login',
}: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const isSignup = mode === 'signup';

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); 

    if (value.length > 3) {
      value = value.slice(0, 3) + '-' + value.slice(3, 8);
    }

    setStudentId(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (isSignup) {
      const idRegex = /^\d{3}-\d{5}$/;
      if (!idRegex.test(studentId)) {
        setLocalError('Invalid Student ID. Format: 000-00000');
        return;
      }
      onSubmit(username, password, studentId);
    } else {
      onSubmit(username, password);
    }
  };

  return (
    <div style={{
      textAlign: 'center', padding: '40px', borderRadius: '16px',
      background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)', width: '320px', color: 'white',
    }}>
      <h1 style={{ marginBottom: '10px' }}>{title}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '8px', border: 'none', outline: 'none' }}
        />

        {isSignup && (
          <input
            type="text"
            inputMode="numeric"
            placeholder="Student ID (000-00000)"
            value={studentId}
            onChange={handleStudentIdChange}
            required
            maxLength={9}
            style={{ 
              padding: '10px', 
              borderRadius: '8px', 
              border: localError ? '2px solid #ff6b6b' : 'none',
              outline: 'none'
            }}
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '8px', border: 'none', outline: 'none' }}
        />

        <button
          disabled={loading}
          style={{
            padding: '10px', borderRadius: '8px', cursor: 'pointer',
            background: '#2563eb', color: 'white', border: 'none', fontWeight: 'bold'
          }}
        >
          {loading ? 'Loading...' : buttonText}
        </button>
      </form>

      {(localError || backendError) && (
        <p style={{ color: '#ff6b6b', marginTop: '10px', fontSize: '0.9rem' }}>
          {localError || backendError}
        </p>
      )}

      <p
        style={{ marginTop: '15px', cursor: 'pointer', color: '#60a5fa', fontSize: '0.85rem' }}
        onClick={() => navigate(isSignup ? '/signin' : '/signup')}
      >
        {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </p>
    </div>
  );
}