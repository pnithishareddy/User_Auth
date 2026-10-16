import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal, useToast } from './UI';

export default function Layout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const doLogout = () => { logout(); toast('Logged out successfully'); nav('/login'); };
  const close = () => setOpen(false);

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">🔐 AccessHub</div>
        <NavLink to="/dashboard" onClick={close}>📊 Dashboard</NavLink>
        <NavLink to="/profile" onClick={close}>👤 Profile</NavLink>
        <NavLink to="/edit-profile" onClick={close}>✏️ Edit Profile</NavLink>
        <NavLink to="/change-password" onClick={close}>🔑 Change Password</NavLink>
        <NavLink to="/settings" onClick={close}>⚙️ Settings</NavLink>
        <div className="spacer" />
        <button onClick={() => setConfirm(true)}>🚪 Logout</button>
      </aside>
      <div className={`backdrop ${open ? 'show' : ''}`} onClick={close} />
      <main className="main">
        <header className="topbar">
          <button className="burger" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <span className="grow">Welcome, <b>{user.name}</b></span>
          <div className="avatar">{user.name[0].toUpperCase()}</div>
        </header>
        <div className="content"><Outlet /></div>
      </main>
      <Modal open={confirm} danger title="Log out?" confirmText="Logout" onClose={() => setConfirm(false)} onConfirm={doLogout}>
        You will need to sign in again to access your dashboard.
      </Modal>
    </div>
  );
}