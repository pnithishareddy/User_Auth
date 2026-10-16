import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import { isEmail, passwordError } from '../utils/validators';
import { AuthLayout, Button, Input, PasswordRules, useToast } from '../components/UI';

const DEMO_EMAIL = 'demo@userlogin.com';
const DEMO_PASSWORD = 'Demo@1234';

export function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const f = useForm({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const fillDemo = () => {
    f.bind('email').onChange({ target: { value: DEMO_EMAIL, type: 'text' } });
    f.bind('password').onChange({ target: { value: DEMO_PASSWORD, type: 'text' } });
    setApiError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!isEmail(f.values.email)) er.email = 'Enter a valid email address';
    if (!f.values.password) er.password = 'Password is required';
    if (Object.keys(er).length) return f.setErrors(er);
    setLoading(true); setApiError('');
    try {
      await login(f.values.email, f.values.password, f.values.remember);
      toast('Welcome back!');
      nav('/dashboard');
    } catch (err) { setApiError(err.message); toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={submit} noValidate>
        {apiError && <div className="alert">{apiError}</div>}
        <Input label="Email" type="email" placeholder="you@example.com" {...f.bind('email')} />
        <Input label="Password" type="password" placeholder="Your password" {...f.bind('password')} />
        <div className="row">
          <label><input type="checkbox" checked={f.values.remember} onChange={f.bind('remember').onChange} /> Remember me</label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <Button block loading={loading}>Sign In</Button>
      </form>
      <p className="center">New here? <Link to="/register">Create account</Link></p>

      <div className="demo-box">
        <b>Demo credentials</b>
        <p>Email: <code>{DEMO_EMAIL}</code></p>
        <p>Password: <code>{DEMO_PASSWORD}</code></p>
        <button type="button" className="btn secondary block" onClick={fillDemo}>
          Use demo credentials
        </button>
      </div>
    </AuthLayout>
  );
}

export function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const f = useForm({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirm } = f.values;
    const er = {};
    if (name.trim().length < 2) er.name = 'Name must be at least 2 characters';
    if (!isEmail(email)) er.email = 'Enter a valid email address';
    if (passwordError(password)) er.password = passwordError(password);
    if (confirm !== password) er.confirm = 'Passwords do not match';
    if (Object.keys(er).length) return f.setErrors(er);
    setLoading(true); setApiError('');
    try {
      await register(f.values);
      toast('Account created! Please sign in.');
      nav('/login');
    } catch (err) { setApiError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start managing your access">
      <form onSubmit={submit} noValidate>
        {apiError && <div className="alert">{apiError}</div>}
        <Input label="Full name" placeholder="John Doe" {...f.bind('name')} />
        <Input label="Email" type="email" placeholder="you@example.com" {...f.bind('email')} />
        <Input label="Password" type="password" {...f.bind('password')} />
        <PasswordRules value={f.values.password} />
        <Input label="Confirm password" type="password" {...f.bind('confirm')} />
        <Button block loading={loading}>Register</Button>
      </form>
      <p className="center">Already registered? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const f = useForm({ email: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(f.values.email)) return f.setErrors({ email: 'Enter a valid email address' });
    setLoading(true);
    setToken(await forgotPassword(f.values.email));
    setLoading(false); setSent(true);
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll send you a reset link">
      {sent ? (
        <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
          <div className="alert success">If this email is registered, a reset link has been sent.</div>
          {token && <p className="muted">Demo mode: <Link to={`/reset-password?token=${token}`}>Open reset link</Link></p>}
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <Input label="Email" type="email" placeholder="you@example.com" {...f.bind('email')} />
          <Button block loading={loading}>Send Reset Link</Button>
        </form>
      )}
      <p className="center"><Link to="/login">← Back to login</Link></p>
    </AuthLayout>
  );
}

export function ResetPassword() {
  const { resetPassword, validToken } = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token');
  const toast = useToast();
  const nav = useNavigate();
  const f = useForm({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  if (!token || !validToken(token)) {
    return (
      <AuthLayout title="Link expired" subtitle="This reset link is invalid or has expired.">
        <p className="center"><Link to="/forgot-password">Request a new link</Link></p>
      </AuthLayout>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (passwordError(f.values.password)) er.password = passwordError(f.values.password);
    if (f.values.confirm !== f.values.password) er.confirm = 'Passwords do not match';
    if (Object.keys(er).length) return f.setErrors(er);
    setLoading(true);
    try { await resetPassword(token, f.values.password); toast('Password reset successfully'); nav('/login'); }
    catch (err) { setApiError(err.message); setLoading(false); }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password">
      <form onSubmit={submit} noValidate>
        {apiError && <div className="alert">{apiError}</div>}
        <Input label="New password" type="password" {...f.bind('password')} />
        <PasswordRules value={f.values.password} />
        <Input label="Confirm password" type="password" {...f.bind('confirm')} />
        <Button block loading={loading}>Reset Password</Button>
      </form>
    </AuthLayout>
  );
}