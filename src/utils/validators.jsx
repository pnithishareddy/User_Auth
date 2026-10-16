export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v.trim());

export const passwordRules = (p = '') => [
  { ok: p.length >= 8, label: '8+ characters' },
  { ok: /[A-Z]/.test(p), label: 'Uppercase letter' },
  { ok: /[a-z]/.test(p), label: 'Lowercase letter' },
  { ok: /\d/.test(p), label: 'A number' },
  { ok: /[^A-Za-z0-9]/.test(p), label: 'A symbol' },
];

export const passwordError = (p) =>
  !p ? 'Password is required' : passwordRules(p).every((r) => r.ok) ? '' : 'Password does not meet all requirements';