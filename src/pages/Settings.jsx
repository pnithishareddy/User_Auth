import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Modal, useToast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { getTheme, setTheme } from '../utils/theme';

const DEFAULTS = {
  emailAlerts: true,
  securityAlerts: true,
  newsletter: false,
  twoFactor: false,
  language: 'en',
  timezone: 'Asia/Kolkata',
  rows: '10',
};

const THEMES = [
  { id: 'light', icon: '☀️', label: 'Light', desc: 'Bright and clean' },
  { id: 'dark', icon: '🌙', label: 'Dark', desc: 'Easy on the eyes' },
  { id: 'system', icon: '💻', label: 'System', desc: 'Match your device' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const load = (id) => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(`settings:${id}`)) };
  } catch {
    return { ...DEFAULTS };
  }
};

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div className="setting-row">
      <div>
        <b>{label}</b>
        <p className="muted">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`switch ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

export default function Settings() {
  const { user, logout, deleteAccount } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [saved, setSaved] = useState(() => load(user.id));
  const [form, setForm] = useState(saved);
  const [theme, setThemeState] = useState(getTheme);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'reset' | 'signout' | 'delete' | null

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const chooseTheme = (mode) => {
    setTheme(mode);
    setThemeState(mode);
    toast(`${THEMES.find((t) => t.id === mode).label} theme applied`);
  };

  const save = async () => {
    setLoading(true);
    await sleep(600);
    localStorage.setItem(`settings:${user.id}`, JSON.stringify(form));
    setSaved(form);
    setLoading(false);
    toast('Settings saved');
  };

  const resetDefaults = () => {
    setForm({ ...DEFAULTS });
    setTheme('light');
    setThemeState('light');
    setModal(null);
    toast('Defaults restored. Click Save to keep them.');
  };

  const signOutAll = () => {
    setModal(null);
    logout();
    toast('Signed out of all devices');
    nav('/login');
  };

  const removeAccount = async () => {
    setModal(null);
    if (user.id === 'demo-user') {
      toast('The demo account cannot be deleted', 'error');
      return;
    }
    await deleteAccount();
    toast('Your account has been deleted');
    nav('/login');
  };

  return (
    <>
      <h1>Settings</h1>
      <p className="muted">Manage your appearance, notifications and account security.</p>

      <Card>
        <h2>Appearance</h2>
        <p className="muted">Choose how AccessHub looks. Changes apply instantly.</p>
        <div className="theme-options" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme === t.id}
              className={`theme-option ${theme === t.id ? 'active' : ''}`}
              onClick={() => chooseTheme(t.id)}
            >
              <span className="theme-icon">{t.icon}</span>
              <b>{t.label}</b>
              <span className="muted">{t.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2>Notifications</h2>
        <Toggle label="Email alerts" desc="Receive account activity updates by email." checked={form.emailAlerts} onChange={(v) => set('emailAlerts', v)} />
        <Toggle label="Security alerts" desc="Get notified about new logins and password changes." checked={form.securityAlerts} onChange={(v) => set('securityAlerts', v)} />
        <Toggle label="Product newsletter" desc="Occasional news and feature announcements." checked={form.newsletter} onChange={(v) => set('newsletter', v)} />
      </Card>

      <Card>
        <h2>Preferences</h2>
        <div className="pref-grid">
          <div className="field">
            <label htmlFor="language">Language</label>
            <select id="language" value={form.language} onChange={(e) => set('language', e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="ta">Tamil</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="timezone">Time zone</label>
            <select id="timezone" value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="Europe/London">London (GMT)</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="rows">Rows per page</label>
            <select id="rows" value={form.rows} onChange={(e) => set('rows', e.target.value)}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h2>Security</h2>
        <Toggle label="Two-factor authentication" desc="Require a verification code when signing in (demo toggle)." checked={form.twoFactor} onChange={(v) => set('twoFactor', v)} />
        <div className="setting-row">
          <div>
            <b>Active sessions</b>
            <p className="muted">Sign out from every device, including this one.</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => setModal('signout')}>Sign out all</Button>
        </div>
      </Card>

      <div className="settings-actions">
        <Button type="button" loading={loading} disabled={!dirty} onClick={save}>Save Changes</Button>
        <Button type="button" variant="secondary" onClick={() => setModal('reset')}>Reset to defaults</Button>
        {dirty && <span className="muted unsaved">You have unsaved changes</span>}
      </div>

      <Card className="danger-zone">
        <h2>Danger zone</h2>
        <div className="setting-row">
          <div>
            <b>Delete account</b>
            <p className="muted">Permanently remove your account and all of its data. This cannot be undone.</p>
          </div>
          <Button type="button" variant="danger" onClick={() => setModal('delete')}>Delete account</Button>
        </div>
      </Card>

      <Modal open={modal === 'reset'} title="Reset to defaults?" confirmText="Reset" onClose={() => setModal(null)} onConfirm={resetDefaults}>
        All settings on this page, including the theme, will go back to their default values.
      </Modal>
      <Modal open={modal === 'signout'} danger title="Sign out everywhere?" confirmText="Sign out all" onClose={() => setModal(null)} onConfirm={signOutAll}>
        You will be logged out and will need to sign in again.
      </Modal>
      <Modal open={modal === 'delete'} danger title="Delete your account?" confirmText="Delete" onClose={() => setModal(null)} onConfirm={removeAccount}>
        This permanently deletes your account. You will not be able to recover it.
      </Modal>
    </>
  );
}