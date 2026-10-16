import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ForgotPassword, Login, Register, ResetPassword } from './pages/AuthPages';
import { ChangePassword, EditProfile, Profile } from './pages/Account';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

const Protected = ({ children }) => (useAuth().user ? children : <Navigate to="/login" replace />);
const Public = ({ children }) => (useAuth().user ? <Navigate to="/dashboard" replace /> : children);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Public><Login /></Public>} />
      <Route path="/register" element={<Public><Register /></Public>} />
      <Route path="/forgot-password" element={<Public><ForgotPassword /></Public>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}