import { createContext, useCallback, useContext, useState } from 'react';
import { passwordRules } from '../utils/validators';

export function Button({ loading, children, variant = '', block, ...rest }) {
  return (
    <button className={`btn ${variant} ${block ? 'block' : ''}`} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="spinner" />} {children}
    </button>
  );
}

export function Input({ label, error, type = 'text', textarea, ...rest }) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={rest.name}>{label}</label>
      <div className="input-wrap">
        <Tag id={rest.name} type={isPwd && show ? 'text' : type} rows={textarea ? 3 : undefined} {...rest} />
        {isPwd && (
          <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p className="err">{error}</p>}
    </div>
  );
}

export const Card = ({ children, className = '' }) => <div className={`card ${className}`}>{children}</div>;

export function PasswordRules({ value }) {
  return (
    <ul className="rules">
      {passwordRules(value).map((r) => (
        <li key={r.label} className={r.ok ? 'ok' : ''}>{r.ok ? '✓' : '○'} {r.label}</li>
      ))}
    </ul>
  );
}

export function Modal({ open, title, children, onClose, onConfirm, confirmText = 'Confirm', danger }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="muted" style={{ marginTop: 8 }}>{children}</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : ''} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">User Login</div>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toasts">
        {toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}