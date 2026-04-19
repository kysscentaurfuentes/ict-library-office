// src/routes/approuter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Router from '../pages/Router';
import LiveView from '../pages/LiveView';
import HomeScreen from '../pages/HomeScreen';
import QrCodeScanner from '../pages/QrCodeScanner'; // 👉 ADD THIS
import SignIn from '../auth/SignIn'; // 👉 ADD THIS
import FaceDetect from "../components/FaceDetect"
import AttendanceLog from '../pages/AttendanceLog' // 👉 ADD THIS
import CheckAvailability from '../pages/CheckAvailability'; // 👉 ADD THIS
import Settings from '../pages/Settings'; // 👉 ADD THIS
import SoftwareAccess from '../pages/SoftwareAccess'; // 👉 ADD THIS
import Printer from '../pages/Printer'; // 👉 ADD THIS
import Feedback from '../pages/Feedback'; // 👉 ADD THIS
import About from '../pages/About'; // 👉 ADD THIS

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
        <Route path="/attendance-log" element={<AttendanceLog />} />
        <Route path="/check-availability" element={<CheckAvailability />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/software-access" element={<SoftwareAccess />} />
        <Route path="/printer" element={<Printer />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/about" element={<About />} />
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