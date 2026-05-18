import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../components/MainLayout';

import HomeScreen from '../pages/HomeScreen';
import Router from '../pages/Router';
import LiveView from '../pages/LiveView';
import QrCodeScanner from '../pages/QrCodeScanner';
import AttendanceLog from '../pages/AttendanceLog';
import CheckAvailability from '../pages/CheckAvailability';
import Settings from '../pages/Settings';
import SoftwareAccess from '../pages/SoftwareAccess';
import Printer from '../pages/Printer';
import Feedback from '../pages/Feedback';
import About from '../pages/About';

import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminRoute from '../guards/AdminRoute';

import SignIn from '../auth/SignIn';
import SignUp from '../auth/SignUp';
import TwoFactor from '../auth/TwoFactor';

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/signin" />} />

        {/* AUTH (NO SIDEBAR) */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/two-factor" element={<TwoFactor />} />

        {/* ✅ ALL MAIN APP PAGES INSIDE LAYOUT */}
        <Route element={<MainLayout />}>
          <Route path="/homescreen" element={<HomeScreen />} />
          <Route path="/router" element={<Router />} />
          <Route path="/live" element={<LiveView />} />
          <Route path="/qr-scanner" element={<QrCodeScanner />} />
          <Route path="/attendance-log" element={<AttendanceLog />} />
          <Route path="/check-availability" element={<CheckAvailability />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/software-access" element={<SoftwareAccess />} />
          <Route path="/printer" element={<Printer />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/about" element={<About />} />

          {/* ADMIN INSIDE SAME LAYOUT */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<div style={{ color: 'white' }}>404</div>} />

      </Routes>
    </HashRouter>
  );
}