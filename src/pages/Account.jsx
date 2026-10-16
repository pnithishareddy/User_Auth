import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import { passwordError } from '../utils/validators';
import { Button, Card, Input, Modal, PasswordRules, useToast } from '../components/UI';

export function Profile() {
  const { user } = useAuth();
  return (
    <>
      <h1>My Profile</h1>
      <Card>
        <div className="profile-head">
          <div className="avatar lg">{user.name[0].toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <h2>{user.name}</h2>
            <p className="muted">{user.email}</p>
          </div>
          <Link to="/edit-profile"><Button>Edit Profile</Button></Link>
        </div>
        <div className="details">
          <div><b>Phone</b>{user.phone || '—'}</div>
          <div><b>Bio</b>{user.bio || '—'}</div>
        </div>
      </Card>
    </>
  );
}

export function EditProfile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const f = useForm({ name: user.name, phone: user.phone, bio: user.bio });
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const validate = (e) => {
    e.preventDefault();
    const er = {};
    if (f.values.name.trim().length < 2) er.name = 'Name must be at least 2 characters';
    if (f.values.phone && !/^[0-9+\-\s]{7,15}$/.test(f.values.phone)) er.phone = 'Enter a valid phone number';
    if (f.values.bio.length > 160) er.bio = 'Bio must be under 160 characters';
    if (Object.keys(er).length) return f.setErrors(er);
    setConfirm(true);
  };

  const save = async () => {
    setConfirm(false); setLoading(true);
    await updateProfile({ ...f.values, name: f.values.name.trim() });
    toast('Profile updated');
    nav('/profile');
  };

  return (
    <>
      <h1>Edit Profile</h1>
      <Card>
        <form className="form-grid" onSubmit={validate} noValidate>
          <Input label="Full name" {...f.bind('name')} />
          <Input label="Email (cannot be changed)" value={user.email} disabled readOnly name="email" />
          <Input label="Phone" placeholder="+91 98765 43210" {...f.bind('phone')} />
          <Input label="Bio" textarea {...f.bind('bio')} />
          <div className="row" style={{ justifyContent: 'flex-start' }}>
            <Button loading={loading}>Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => nav('/profile')}>Cancel</Button>
          </div>
        </form>
      </Card>
      <Modal open={confirm} title="Save changes?" onClose={() => setConfirm(false)} onConfirm={save}>
        Your profile details will be updated.
      </Modal>
    </>
  );
}

export function ChangePassword() {
  const { changePassword } = useAuth();
  const toast = useToast();
  const f = useForm({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const { current, next, confirm } = f.values;
    const er = {};
    if (!current) er.current = 'Current password is required';
    if (passwordError(next)) er.next = passwordError(next);
    if (confirm !== next) er.confirm = 'Passwords do not match';
    if (Object.keys(er).length) return f.setErrors(er);
    setLoading(true); setApiError('');
    try {
      await changePassword(current, next);
      toast('Password changed successfully');
      f.setErrors({});
      e.target.reset();
    } catch (err) { setApiError(err.message); toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <h1>Change Password</h1>
      <Card>
        <form className="form-grid" onSubmit={submit} noValidate>
          {apiError && <div className="alert">{apiError}</div>}
          <Input label="Current password" type="password" {...f.bind('current')} />
          <Input label="New password" type="password" {...f.bind('next')} />
          <PasswordRules value={f.values.next} />
          <Input label="Confirm new password" type="password" {...f.bind('confirm')} />
          <div><Button loading={loading}>Update Password</Button></div>
        </form>
      </Card>
    </>
  );
}