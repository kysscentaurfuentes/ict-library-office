import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from '../auth/SignIn';
import SignUp from '../auth/SignUp';
import HomeScreen from '../pages/HomeScreen';
import QrCodeScanner from '../pages/QrCodeScanner';
import ProtectedRoute from '../guards/ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/qr-scanner"
          element={
            <ProtectedRoute>
              <QrCodeScanner />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}