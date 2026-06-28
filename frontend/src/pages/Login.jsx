import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { showError } from '../components/Toast';
import ToastContainer from '../components/Toast';
import apiClient from '../api/client';

// ── Password strength validator ────────────────────────────────────────────
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!]).{8,}$/;

function validatePassword(pwd) {
  return {
    length:  pwd.length >= 8,
    upper:   /[A-Z]/.test(pwd),
    digit:   /\d/.test(pwd),
    special: /[@#$%&*!]/.test(pwd),
  };
}

// ── Password strength indicator ────────────────────────────────────────────
function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const v = validatePassword(password);
  const score = Object.values(v).filter(Boolean).length;
  const colors = ['#ba1a1a', '#ff6b00', '#f5a623', '#4caf50'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

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
      {score === 4 && (
        <div style={{ fontSize: '0.72rem', color: '#4caf50', fontWeight: 600, marginTop: 4 }}>
          ✓ {labels[score - 1]} password
        </div>
      )}
    </div>
  );
}

// ── OTP Verification Dialog ────────────────────────────────────────────────
function OtpDialog({ email, formData, onSuccess, onClose }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const inputRef = useRef(null);
  const { syncFromStorage } = useAuth();

  // Start countdown on mount
  useEffect(() => {
    inputRef.current?.focus();
    const timer = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setError('');
    setVerifying(true);
    try {
      const { data } = await apiClient.post('/auth/verify-and-register', {
        shopName: formData.shopName,
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password,
        otp: otp.trim(),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('sk_user', JSON.stringify(data.user));
      syncFromStorage();
      onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await apiClient.post('/auth/send-otp', {
        shopName: formData.shopName,
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password,
      });
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 28px',
        width: '100%', maxWidth: 360,
        boxShadow: 'var(--shadow-lg)',
        animation: 'popIn 0.22s cubic-bezier(.34,1.56,.64,1)',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--secondary)', display: 'flex', alignItems: 'center',
            padding: 4, borderRadius: 'var(--radius)',
          }}
          aria-label="Close"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, #fff5f0, #ffe4d4)',
            border: '2px solid var(--primary-fixed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)' }}>mark_email_read</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>
            Verify your email
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: 6, lineHeight: 1.5 }}>
            We sent a 6-digit code to<br />
            <strong style={{ color: 'var(--on-surface)' }}>{email}</strong>
          </div>
        </div>

        {/* OTP Input */}
        <div style={{ marginBottom: 16 }}>
          <input
            ref={inputRef}
            id="otp-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            className="form-control"
            style={{
              height: 56, textAlign: 'center',
              fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.35em',
              fontFamily: 'monospace',
            }}
            placeholder="——————"
            value={otp}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '');
              setOtp(val);
              setError('');
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleVerify(); }}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background: 'var(--error-container)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius)',
            padding: '8px 12px',
            marginBottom: 14,
            fontSize: '0.78rem',
            color: 'var(--on-error-container)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
            {error}
          </div>
        )}

        {/* Verify button */}
        <button
          id="otp-verify-btn"
          className="btn btn-primary w-100"
          style={{ height: 48, fontSize: '0.875rem', fontWeight: 600, marginBottom: 16 }}
          onClick={handleVerify}
          disabled={verifying || otp.length < 6}
        >
          {verifying ? (
            <span className="sk-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }}>verified_user</span>
              Verify & Create Account
            </>
          )}
        </button>

        {/* Resend */}
        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--secondary)' }}>
          Didn't receive it?{' '}
          <button
            id="otp-resend-btn"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            style={{
              background: 'none', border: 'none', cursor: cooldown > 0 ? 'default' : 'pointer',
              color: cooldown > 0 ? 'var(--secondary-fixed-dim)' : 'var(--primary)',
              fontWeight: 600, fontSize: '0.78rem', padding: 0,
            }}
          >
            {resending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────
export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ shopName: '', ownerName: '', email: '', password: '' });
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: () => login(form.email, form.password),
    onSuccess: () => navigate('/'),
    onError: (err) => showError(err.response?.data?.message || 'Login failed. Please try again.'),
  });

  // Step 1 — send OTP (register tab)
  const sendOtpMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/send-otp', {
      shopName: form.shopName,
      ownerName: form.ownerName,
      email: form.email,
      password: form.password,
    }),
    onSuccess: () => setShowOtpDialog(true),
    onError: (err) => showError(err.response?.data?.message || 'Failed to send OTP. Please try again.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tab === 'login') {
      if (!form.email || !form.password) return showError('Email and password are required.');
      loginMutation.mutate();
    } else {
      if (!form.shopName || !form.ownerName || !form.email || !form.password) {
        return showError('All fields are required.');
      }
      if (!PASSWORD_REGEX.test(form.password)) {
        return showError('Password must be ≥8 chars with an uppercase letter, a number, and a special character (@#$%&*!).');
      }
      sendOtpMutation.mutate();
    }
  };

  const handleOtpSuccess = (data) => {
    setShowOtpDialog(false);
    navigate('/');
  };

  const isLoading = loginMutation.isPending || sendOtpMutation.isPending;
  const pwdValid = validatePassword(form.password);
  const pwdPasses = Object.values(pwdValid).every(Boolean);

  return (
    <div className="auth-page">
      {/* OTP Dialog */}
      {showOtpDialog && (
        <OtpDialog
          email={form.email}
          formData={form}
          onSuccess={handleOtpSuccess}
          onClose={() => setShowOtpDialog(false)}
        />
      )}

      {/* Hero Banner */}
      <div className="auth-hero">
        <div className="auth-hero__icon">
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 36 }}>storefront</span>
        </div>
        <div className="auth-hero__title">Vriddhi</div>
        <div className="auth-hero__sub">Smart Business Ledger for your shop</div>
      </div>

      {/* Form Card */}
      <div className="auth-form-card">

        {/* Tab Switch */}
        <div className="auth-tab">
          <button
            id="auth-tab-login"
            className={`auth-tab__btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
            type="button"
          >
            Sign In
          </button>
          <button
            id="auth-tab-register"
            className={`auth-tab__btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
            type="button"
          >
            Create Shop
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {tab === 'register' && (
            <>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                  Shop Name
                </label>
                <input
                  id="register-shopname"
                  type="text"
                  className="form-control"
                  style={{ height: 48 }}
                  placeholder="e.g. Smith's Bodega"
                  value={form.shopName}
                  onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                  autoComplete="organization"
                />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                  Owner Name
                </label>
                <input
                  id="register-ownername"
                  type="text"
                  className="form-control"
                  style={{ height: 48 }}
                  placeholder="Your full name"
                  value={form.ownerName}
                  onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                  autoComplete="name"
                />
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              className="form-control"
              style={{ height: 48 }}
              placeholder="email@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
          </div>

          <div className={tab === 'register' ? 'mb-3' : 'mb-2'}>
            <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ height: 48, paddingRight: 44 }}
                placeholder={tab === 'register' ? 'Min. 8 chars' : '••••••••'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--secondary)', display: 'flex', alignItems: 'center',
                }}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {/* Password strength UI (register only) */}
            {tab === 'register' && form.password && (
              <PasswordStrengthBar password={form.password} />
            )}
          </div>

          {/* Forgot Password link (login tab only) */}
          {tab === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <button
                id="forgot-password-link"
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--primary)', fontWeight: 500,
                  fontSize: '0.78rem', padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary w-100"
            style={{ height: 48, fontSize: '0.875rem', fontWeight: 600 }}
            disabled={isLoading || (tab === 'register' && form.password.length > 0 && !pwdPasses)}
          >
            {isLoading ? (
              <span className="sk-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              tab === 'login' ? 'Sign In to Your Shop' : 'Create My Shop'
            )}
          </button>
        </form>

      </div>

      <ToastContainer />
    </div>
  );
}
