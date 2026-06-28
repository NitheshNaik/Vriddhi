import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError } from '../components/Toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateLocalUser, setIsAuthenticated } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ shopName: '', ownerName: '' });
  const [avatarHover, setAvatarHover] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch fresh profile from server
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/profile');
      return data;
    },
    onSuccess: (data) => {
      setForm({ shopName: data.shopName, ownerName: data.ownerName });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('token'); // Hard purge the stored user session key
    setIsAuthenticated(false);        // Clear root tracking context parameters
    navigate('/login');               // Shift UI viewport back to the logging card entry view
  };

  // Start editing — prefill form
  const startEdit = () => {
    setForm({ shopName: profile?.shopName || user?.shopName || '', ownerName: profile?.ownerName || user?.ownerName || '' });
    setEditing(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => apiClient.put('/auth/profile', { shopName: form.shopName, ownerName: form.ownerName }),
    onSuccess: ({ data }) => {
      updateLocalUser({ shopName: data.shopName, ownerName: data.ownerName });
      showSuccess('Profile updated successfully!');
      setEditing(false);
    },
    onError: (err) => showError(err.response?.data?.message || 'Failed to save profile.'),
  });

  // ── Profile photo upload mutation ────────────────────────────────────────
  const photoMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('photo', file);
      return apiClient.post('/auth/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: ({ data }) => {
      updateLocalUser({ profilePhoto: data.profilePhoto });
      queryClient.setQueryData(['profile'], (old) => ({ ...old, profilePhoto: data.profilePhoto }));
      showSuccess('Profile photo updated!');
    },
    onError: (err) => showError(err.response?.data?.message || 'Failed to upload photo.'),
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) photoMutation.mutate(file);
    e.target.value = ''; // reset input so same file can be re-selected
  };

  const displayUser = profile || user || {};
  const initials = ((displayUser.shopName || 'S')[0] + (displayUser.ownerName || 'O')[0]).toUpperCase();
  const photoSrc = displayUser.profilePhoto || null;

  const menuItems = [
    { icon: 'storefront', label: 'Shop Name',    value: displayUser.shopName },
    { icon: 'person',     label: 'Owner Name',   value: displayUser.ownerName },
    { icon: 'email',      label: 'Email Address',value: displayUser.email },
  ];

  const appItems = [
    { icon: 'info',          label: 'App Version' },
    { icon: 'help_outline',  label: 'Help & Support' },
    { icon: 'privacy_tip',   label: 'Privacy Policy' },
  ];

  return (
    <>
      {/* ── Main profile view ─────────────────────────────── */}
      <>
        {/* ── Avatar + Name ──────────────────────────────── */}
          <section className="text-center mb-4">
            {isLoading ? (
              <div className="sk-spinner" style={{ margin: '0 auto 16px' }} />
            ) : (
              /* ── Photo-aware avatar with camera overlay ─── */
              <div
                style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt="Profile"
                    style={{
                      width: 80, height: 80,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--primary-fixed)',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div className="profile-avatar" style={{ width: 80, height: 80, fontSize: '1.6rem' }}>
                    {initials}
                  </div>
                )}

                {/* ── Camera overlay trigger ── */}
                <button
                  id="profile-photo-btn"
                  aria-label="Change profile photo"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoMutation.isPending}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: 'none',
                    background: avatarHover ? 'rgba(0,0,0,0.42)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                >
                  {photoMutation.isPending ? (
                    <span className="sk-spinner" style={{ width: 20, height: 20, borderWidth: 2, borderColor: '#fff transparent transparent transparent' }} />
                  ) : (
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 22,
                        color: '#ffffff',
                        opacity: avatarHover ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        pointerEvents: 'none',
                      }}
                    >
                      photo_camera
                    </span>
                  )}
                </button>

                {/* ── Hidden file input ── */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
            )}
            <h1 className="page-title" style={{ fontSize: '1.3rem' }}>{displayUser.shopName || '—'}</h1>
            <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', margin: '2px 0 0' }}>
              {displayUser.ownerName}
            </p>
          </section>

          {/* ── Edit Form ──────────────────────────────────── */}
          {editing ? (
            <section className="sk-card p-3 mb-3 fade-in">
              <h2 className="section-title" style={{ fontSize: '1rem', marginBottom: 16 }}>Edit Profile</h2>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Shop Name</label>
                <input
                  id="profile-shopname"
                  type="text"
                  className="form-control"
                  style={{ height: 48 }}
                  value={form.shopName}
                  onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))}
                />
              </div>
              <div className="mb-4">
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Owner Name</label>
                <input
                  id="profile-ownername"
                  type="text"
                  className="form-control"
                  style={{ height: 48 }}
                  value={form.ownerName}
                  onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  id="profile-cancel-btn"
                  className="btn flex-1"
                  style={{ flex: 1, height: 44, border: '1px solid var(--surface-variant)', background: 'none', color: 'var(--secondary)', borderRadius: 'var(--radius-lg)', fontWeight: 500 }}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  id="profile-save-btn"
                  className="btn btn-primary flex-1"
                  style={{ flex: 1, height: 44 }}
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !form.shopName || !form.ownerName}
                >
                  {saveMutation.isPending ? <span className="sk-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Save Changes'}
                </button>
              </div>
            </section>
          ) : (
            /* ── Shop Details Card ──────────────────────── */
            <section className="mb-3">
              <div className="settings-section-title">Shop Details</div>
              <div className="sk-card overflow-hidden mb-1">
                {menuItems.map((item, idx) => (
                  <div key={idx} className="settings-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>{item.icon}</span>
                      <span className="settings-row__label">{item.label}</span>
                    </div>
                    <span className="settings-row__value">{item.value || '—'}</span>
                  </div>
                ))}
              </div>
              <button
                id="profile-edit-btn"
                className="btn btn-primary w-100"
                style={{ height: 46, fontSize: '0.85rem', fontWeight: 600 }}
                onClick={startEdit}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }}>edit</span>
                Edit Profile
              </button>
            </section>
          )}

          {/* ── App Settings Card ──────────────────────────── */}
          <section className="mb-3">
            <div className="settings-section-title">App</div>
            <div className="sk-card overflow-hidden">
              {appItems.map((item, idx) => {
                const handleClick = () => {
                  if (item.label === 'Help & Support') navigate('/profile/help');
                  if (item.label === 'Privacy Policy')  navigate('/profile/privacy');
                  if (item.label === 'App Version')     navigate('/profile/version');
                };
                const rowId =
                  item.label === 'Help & Support' ? 'help-support-row' :
                  item.label === 'Privacy Policy'  ? 'privacy-policy-row' :
                  item.label === 'App Version'     ? 'app-version-row' : undefined;
                return (
                  <div
                    key={idx}
                    className="settings-row"
                    style={{ cursor: 'pointer' }}
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                    id={rowId}
                    onKeyDown={e => e.key === 'Enter' && handleClick()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>
                        {item.icon}
                      </span>
                      <span className="settings-row__label" style={{ color: 'var(--on-surface)' }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>
                      chevron_right
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Logout ─────────────────────────────────────── */}
          <button
            id="logout-btn"
            className="btn w-100"
            style={{
              height: 48, fontWeight: 600, fontSize: '0.875rem',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              background: 'none',
              borderRadius: 'var(--radius-lg)',
              transition: 'background 0.15s',
              marginBottom: 8,
            }}
            onClick={handleLogout}
            onMouseOver={e => e.currentTarget.style.background = 'var(--error-container)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }}>logout</span>
            Sign Out
          </button>

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--secondary-fixed-dim)', marginTop: 8 }}>
          Vriddhi v1.0.0 · Smart Business Ledger
        </p>
      </>
    </>
  );
}
