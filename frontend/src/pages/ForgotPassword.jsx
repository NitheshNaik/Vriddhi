import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { showError } from '../components/Toast';
import ToastContainer from '../components/Toast';
import apiClient from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => apiClient.post('/auth/forgot-password', { email: email.trim() }),
    onSuccess: () => setSubmitted(true),
    onError: (err) => showError(err.response?.data?.message || 'Something went wrong. Please try again.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return showError('Please enter your email address.');
    mutation.mutate();
  };

  return (
    <div className="auth-page">
      {/* Hero */}
      <div className="auth-hero">
        <div className="auth-hero__icon">
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 36 }}>lock_reset</span>
        </div>
        <div className="auth-hero__title">Forgot Password?</div>
        <div className="auth-hero__sub">Enter your email to receive a reset link</div>
      </div>

      <div className="auth-form-card">
        {submitted ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#2e7d32' }}>mark_email_read</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 10 }}>
              Check your inbox!
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--secondary)', lineHeight: 1.6, marginBottom: 28 }}>
              If an account is registered with <strong style={{ color: 'var(--on-surface)' }}>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            
            <button
              id="back-to-login-btn"
              className="btn btn-primary w-100"
              style={{ height: 48, fontSize: '0.875rem', fontWeight: 600 }}
              onClick={() => navigate('/login')}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          /* ── Request form ── */
          <form onSubmit={handleSubmit} noValidate>
            <p style={{ fontSize: '0.83rem', color: 'var(--secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              Enter the email address associated with your Vriddhi account and we’ll send you a secure link to reset your password.
            </p>

            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                Email Address
              </label>
              <input
                id="forgot-email-input"
                type="email"
                className="form-control"
                style={{ height: 48 }}
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <button
              id="send-reset-btn"
              type="submit"
              className="btn btn-primary w-100"
              style={{ height: 48, fontSize: '0.875rem', fontWeight: 600, marginBottom: 16 }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span className="sk-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }}>send</span>
                  Send Reset Link
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--secondary)' }}>
              <button
                id="forgot-back-btn"
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                onClick={() => navigate('/login')}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
