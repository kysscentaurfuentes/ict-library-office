// frontend/src/layouts/AuthLayout.tsx
import { Outlet } from 'react-router-dom';
import AuthBackground from '../components/AuthBackground';

export default function AuthLayout() {

  return (
    <AuthBackground>

      <div
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Outlet />
      </div>

    </AuthBackground>
  );
}