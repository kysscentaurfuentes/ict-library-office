// src/routes/approuter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Router from '../pages/Router';
import LiveView from '../pages/LiveView';
import HomeScreen from '../pages/HomeScreen';
import QrCodeScanner from '../pages/QrCodeScanner'; // 👉 ADD THIS
import SignIn from '../auth/SignIn'; // 👉 ADD THIS
import FaceDetect from "../components/FaceDetect"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/homescreen" />} />

        {/* Pages */}
        <Route path="/router" element={<Router />} />
        <Route path="/live" element={<LiveView />} />
        <Route path="/homescreen" element={<HomeScreen />} />
        <Route path="/qr-scanner" element={<QrCodeScanner />} /> {/* ✅ FIX */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/face-detect" element={<FaceDetect />} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{ color: 'white', padding: '20px' }}>
            <h2>404 - Page Not Found</h2>
          </div>
        } />

      </Routes>
    </BrowserRouter>
  );
}