import { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const read = (store, key) => { try { return JSON.parse(store.getItem(key)); } catch { return null; } };

const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@userlogin.com',
  password: 'Demo@1234',
  phone: '+91 98765 43210',
  bio: 'Sample account for testing the dashboard.',
};

const saveUsers = (u) => localStorage.setItem('users', JSON.stringify(u));

const getUsers = () => {
  // Drop the old demo account from earlier versions, if present
  const users = (read(localStorage, 'users') || []).filter((u) => u.email !== 'demo@accesshub.com');
  if (!users.some((u) => u.email === DEMO_USER.email)) {
    const next = [DEMO_USER, ...users];
    saveUsers(next);
    return next;
  }
  return users;
};

const loadUser = () => {
  const s = read(localStorage, 'session') || read(sessionStorage, 'session');
  if (!s || s.exp < Date.now()) { localStorage.removeItem('session'); sessionStorage.removeItem('session'); return null; }
  return getUsers().find((u) => u.id === s.id) || null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = async (email, password, remember) => {
    await sleep(700);
    const u = getUsers().find((x) => x.email === email.trim().toLowerCase());
    if (!u || u.password !== password) throw new Error('Invalid email or password');
    const session = { id: u.id, exp: Date.now() + (remember ? 7 * 864e5 : 2 * 36e5) };
    (remember ? localStorage : sessionStorage).setItem('session', JSON.stringify(session));
    setUser(u);
  };

  const register = async ({ name, email, password }) => {
    await sleep(700);
    const users = getUsers();
    const mail = email.trim().toLowerCase();
    if (users.some((u) => u.email === mail)) throw new Error('An account with this email already exists');
    saveUsers([...users, { id: Date.now(), name: name.trim(), email: mail, password, phone: '', bio: '' }]);
  };

  const logout = () => {
    localStorage.removeItem('session');
    sessionStorage.removeItem('session');
    setUser(null);
  };

  const deleteAccount = async () => {
    await sleep(600);
    saveUsers(getUsers().filter((u) => u.id !== user.id));
    localStorage.removeItem(`settings:${user.id}`);
    logout();
  };

  const updateProfile = async (data) => {
    await sleep(600);
    const updated = { ...user, ...data };
    saveUsers(getUsers().map((u) => (u.id === user.id ? updated : u)));
    setUser(updated);
  };

  const changePassword = async (current, next) => {
    await sleep(600);
    if (current !== user.password) throw new Error('Current password is incorrect');
    if (next === current) throw new Error('New password must be different');
    const updated = { ...user, password: next };
    saveUsers(getUsers().map((u) => (u.id === user.id ? updated : u)));
    setUser(updated);
  };

  // Demo only: a real app would email this token
  const forgotPassword = async (email) => {
    await sleep(700);
    const u = getUsers().find((x) => x.email === email.trim().toLowerCase());
    if (!u) return null;
    const token = Math.random().toString(36).slice(2);
    localStorage.setItem('reset', JSON.stringify({ email: u.email, token, exp: Date.now() + 15 * 6e4 }));
    return token;
  };

  const validToken = (t) => { const r = read(localStorage, 'reset'); return !!r && r.token === t && r.exp > Date.now(); };

  const resetPassword = async (token, password) => {
    await sleep(700);
    const r = read(localStorage, 'reset');
    if (!validToken(token)) throw new Error('Reset link is invalid or expired');
    saveUsers(getUsers().map((u) => (u.email === r.email ? { ...u, password } : u)));
    localStorage.removeItem('reset');
  };

  return (
    <Ctx.Provider value={{ user, login, register, logout, deleteAccount, updateProfile, changePassword, forgotPassword, resetPassword, validToken }}>
      {children}
    </Ctx.Provider>
  );
}