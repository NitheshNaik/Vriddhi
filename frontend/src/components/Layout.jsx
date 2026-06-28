import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import ToastContainer from './Toast';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ── Fetch profile to get profilePhoto ─────────────────────────────────────
  // Uses TanStack Query's cache — same key as Profile.jsx, so no duplicate
  // requests when both components are mounted.
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/profile');
      return data;
    },
    staleTime: 1000 * 60 * 5,  // 5 min — navbar doesn't need instant refresh
    retry: false,               // don't retry on network error (silent)
  });

  const photoSrc  = profile?.profilePhoto || user?.profilePhoto || null;
  const initials  = (
    ((profile?.shopName || user?.shopName || 'S')[0]) +
    ((profile?.ownerName || user?.ownerName || 'O')[0])
  ).toUpperCase();

  const navItems = [
    { path: '/',          icon: 'dashboard',    label: 'Home' },
    { path: '/reports',   icon: 'receipt_long', label: 'Reports' },
    { path: '/inventory', icon: 'inventory_2',  label: 'Inventory' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Top App Bar ───────────────────────────────────── */}
      <header className="top-app-bar">
        <Link 
          to="/" 
          className="top-app-bar__title d-flex align-items-center gap-2 text-decoration-none" 
          style={{ color: 'inherit' }}
        >
          <img 
            src="/icon-192.png" 
            alt="Vriddhi Logo" 
            style={{ 
              height: '34px', 
              width: '34px', 
              objectFit: 'contain' 
            }} 
            className="d-inline-block align-top logo-brand"
          />
          <span className="fw-bold">Vriddhi</span>
        </Link>

        {/* ── Navbar avatar ─────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            id="nav-profile-icon"
            onClick={() => navigate('/profile')}
            aria-label="Profile"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              transition: 'opacity 0.15s',
            }}
          >
            {photoSrc ? (
              /* ── Uploaded profile photo ── */
              <img
                src={photoSrc}
                alt="Profile"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: location.pathname === '/profile'
                    ? '2px solid var(--primary)'
                    : '2px solid var(--surface-variant)',
                  transition: 'border-color 0.15s',
                }}
              />
            ) : (
              /* ── Initials fallback ── */
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: location.pathname === '/profile'
                    ? 'var(--primary)'
                    : 'var(--surface-container-high)',
                  color: location.pathname === '/profile'
                    ? 'var(--on-primary)'
                    : 'var(--on-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  border: '2px solid var(--surface-variant)',
                  transition: 'background 0.15s, color 0.15s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {initials}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* ── Page Content ──────────────────────────────────── */}
      <main className="page-content fade-in">
        {children}
      </main>

      {/* ── Bottom Navigation ─────────────────────────────── */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {navItems.map(item => (
          <button
            key={item.path}
            id={`nav-${item.label.toLowerCase()}`}
            className={`bottom-nav__item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <span className={`material-symbols-outlined nav-icon ${isActive(item.path) ? 'icon-filled' : ''}`}>
              {item.icon}
            </span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Toast Notifications ───────────────────────────── */}
      <ToastContainer />
    </>
  );
}
