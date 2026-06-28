import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { showError } from '../components/Toast';
import ToastContainer from '../components/Toast';
import apiClient from '../api/client';

// ── Password strength (same rules as Login.jsx) ────────────────────────────
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!]).{8,}$/;

function validatePassword(pwd) {
  return {
    length:  pwd.length >= 8,
    upper:   /[A-Z]/.test(pwd),
    digit:   /\d/.test(pwd),
    special: /[@#$%&*!]/.test(pwd),
  };
}

function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const v = validatePassword(password);
  const score = Object.values(v).filter(Boolean).length;
  const colors = ['#ba1a1a', '#ff6b00', '#f5a623', '#4caf50'];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: i < score ? colors[score - 1] : 'var(--surface-container-high)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { key: 'length',  label: '8+ chars' },
          { key: 'upper',   label: 'Uppercase' },
          { key: 'digit',   label: 'Number' },
          { key: 'special', label: 'Special (@#$%&*!)' },
        ].map(({ key, label }) => (
          <span key={key} style={{
            fontSize: '0.68rem', fontWeight: 500, padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: v[key] ? '#e8f5e9' : 'var(--surface-container)',
            color: v[key] ? '#2e7d32' : 'var(--secondary)',
            transition: 'all 0.2s',
          }}>
            {v[key] ? '✓' : '○'} {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone]           = useState(false);

  const mutation = useMutation({
    mutationFn: () => apiClient.post('/auth/reset-password', { email, token, password }),
    onSuccess: () => setDone(true),
    onError: (err) => showError(err.response?.data?.message || 'Failed to reset password. The link may have expired.'),
  });

  const pwdValid = validatePassword(password);
  const pwdPasses = Object.values(pwdValid).every(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || !confirm) return showError('Please fill in both password fields.');
    if (!pwdPasses) return showError('Password must be ≥8 chars with an uppercase letter, a number, and a special character (@#$%&*!).');
    if (password !== confirm) return showError('Passwords do not match.');
    if (!token || !email) return showError('Invalid reset link. Please request a new one.');
    mutation.mutate();
  };

  // Invalid link state
  if (!token || !email) {
    return (
      <div className="auth-page">
        <div className="auth-hero">
          <div className="auth-hero__icon">
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 36 }}>lock_reset</span>
          </div>
          <div className="auth-hero__title">Reset Password</div>
          <div className="auth-hero__sub">Create a new secure password</div>
        </div>
        <div className="auth-form-card" style={{ textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--error)', display: 'block', marginBottom: 12 }}>link_off</span>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>Invalid Reset Link</div>
          <p style={{ fontSize: '0.83rem', color: 'var(--secondary)', marginBottom: 24 }}>
            This link is invalid or has expired. Please request a new password reset.
          </p>
          <button className="btn btn-primary w-100" style={{ height: 48, fontWeight: 600 }} onClick={() => navigate('/forgot-password')}>
            Request New Link
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Hero */}
      <div className="auth-hero">
        <div className="auth-hero__icon">
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 36 }}>lock_reset</span>
        </div>
        <div className="auth-hero__title">Reset Password</div>
        <div className="auth-hero__sub">Create a new secure password</div>
      </div>

      <div className="auth-form-card">
        {done ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#2e7d32' }}>lock</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 10 }}>
              Password Reset!
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <button
              id="reset-go-login-btn"
              className="btn btn-primary w-100"
              style={{ height: 48, fontSize: '0.875rem', fontWeight: 600 }}
              onClick={() => navigate('/login')}
            >
              Sign In Now
            </button>
          </div>
        ) : (
          /* ── Reset form ── */
          <form onSubmit={handleSubmit} noValidate>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Resetting password for <strong style={{ color: 'var(--on-surface)' }}>{email}</strong>
            </p>

            {/* New Password */}
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-password-input"
                  type={showPwd ? 'text' : 'password'}
                  className="form-control"
                  style={{ height: 48, paddingRight: 44 }}
                  placeholder="Min. 8 chars"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', alignItems: 'center' }}
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {/* Live strength indicator */}
              {password && <PasswordStrengthBar password={password} />}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-confirm-input"
                  type={showConfirm ? 'text' : 'password'}
                  className="form-control"
                  style={{
                    height: 48, paddingRight: 44,
                    borderColor: confirm && confirm !== password ? 'var(--error)' : undefined,
                  }}
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', alignItems: 'center' }}
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {confirm && confirm !== password && (
                <div style={{ fontSize: '0.72rem', color: 'var(--error)', marginTop: 4 }}>
                  ✗ Passwords don't match
                </div>
              )}
              {confirm && confirm === password && pwdPasses && (
                <div style={{ fontSize: '0.72rem', color: '#4caf50', marginTop: 4 }}>
                  ✓ Passwords match
                </div>
              )}
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              className="btn btn-primary w-100"
              style={{ height: 48, fontSize: '0.875rem', fontWeight: 600, marginBottom: 16 }}
              disabled={mutation.isPending || !pwdPasses || password !== confirm}
            >
              {mutation.isPending ? (
                <span className="sk-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }}>lock_reset</span>
                  Reset Password
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                onClick={() => navigate('/forgot-password')}
              >
                ← Request a new link
              </button>
            </div>
          </form>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
