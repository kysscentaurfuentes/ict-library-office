import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../components/MainLayout';

import HomeScreen from '../pages/HomeScreen';

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
import Router from '../pages/Router';
import AuditLogs from '../pages/Admin/AuditLogs';
import AdminRoute from '../guards/AdminRoute';
import ScanLogs from '../pages/Admin/ScanLogs';
import SystemMonitoring from '../pages/Admin/SystemMonitoring';
import SecurityMonitoring from '../pages/Admin/SecurityMonitoring';
import OperationalIntelligence from '../pages/Admin/OperationalIntelligence';
import SurveillanceAI from '../pages/Admin/SurveillanceAI';
import NetworkOperationsCenter from '../pages/Admin/NetworkOperationsCenter';

import SignIn from '../auth/SignIn';
import SignUp from '../auth/SignUp';
import TwoFactor from '../auth/TwoFactor';
import PendingApproval from '../auth/PendingApproval';
import RejectedApproval from '../auth/RejectedApproval';
import VerifySignupOTP from "../auth/VerifySignupOTP";
import ForgotPassword from '../auth/ForgotPassword';
import VerifyForgotPassword from '../auth/VerifyForgotPasswordOTP'
import ResetForgotPassword from '../auth/ResetForgotPassword'
import AuthLayout from '../layouts/AuthLayout';
import PolicyAcknowledgement from '../auth/PolicyAcknowledgement';
import PolicyGuard from '../guards/PolicyGuard';

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/signin" />} />

        {/* AUTH PAGES (NO SIDEBAR) */}
        <Route element={<AuthLayout />}>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/two-factor" element={<TwoFactor />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/rejected-approval" element={<RejectedApproval />} />
        <Route path="/verify-signup-otp" element={<VerifySignupOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/verify" element={<VerifyForgotPassword />} />
        <Route path="/forgot-password/reset" element={<ResetForgotPassword />} />
        <Route path="/signup-policy" element={<PolicyAcknowledgement />} />
        <Route path="/policy-update" element={<PolicyAcknowledgement />} />
        </Route>

        {/* ✅ ALL MAIN APP PAGES INSIDE LAYOUT */}
       <Route
  element={
    <PolicyGuard>
      <MainLayout />
    </PolicyGuard>
  }
>
          <Route path="/homescreen" element={<HomeScreen />} />
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
          <Route path="/admin" element={<AdminRoute> <AdminDashboard /></AdminRoute>}/>
          <Route path="/router" element={<Router />} />
          <Route path="/admin/audit-logs" element={ <AdminRoute> <AuditLogs /> </AdminRoute> }/>
          <Route path="/admin/scan-logs" element={ <AdminRoute> <ScanLogs /> </AdminRoute> }/>
          <Route path="/admin/system-monitoring" element={ <AdminRoute> <SystemMonitoring /> </AdminRoute> }/>
          <Route path="/admin/security-monitoring" element={ <AdminRoute> <SecurityMonitoring /> </AdminRoute> }/>
          <Route path="/admin/operational-intelligence" element={ <AdminRoute> <OperationalIntelligence /> </AdminRoute> }/>
          <Route path="/admin/surveillance-ai" element={ <AdminRoute> <SurveillanceAI /> </AdminRoute> }/>
          <Route path="/admin/network-operations" element={ <AdminRoute> <NetworkOperationsCenter /> </AdminRoute> }/>

        </Route>

        <Route path="*" element={<div style={{ color: 'white' }}>404</div>} />

      </Routes>
    </HashRouter>
  );
}