import { useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

// ✅ Type definitions (IMPORTANT)
type LoginResponse = {
  login: {
    token: string
    user: {
      username: string
      role: string
    }
  }
}

type LoginVariables = {
  username: string
  password: string
}

// ✅ GraphQL Mutation
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        username
        role
      }
    }
  }
`

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // ✅ Typed useMutation (FIXES ALL TS ERRORS)
  const [login, { data, loading, error }] = useMutation<LoginResponse, LoginVariables>(LOGIN_MUTATION)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await login({
  variables: { username, password }
})

if (res.data?.login.token) {
  localStorage.setItem('token', res.data.login.token)
}
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h1>ICT Library System</h1>

      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px', background: '#242424' }}>
        <h3>Login</h3>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px' }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px' }}
          />

          <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>

        {/* ✅ Safe rendering */}
        {data?.login && (
          <p style={{ color: '#4caf50', marginTop: '15px' }}>
            Success! Welcome back, <b>{data.login.user.username}</b>.
          </p>
        )}

        {error && (
          <p style={{ color: '#f44336', marginTop: '15px' }}>
            {error.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default App