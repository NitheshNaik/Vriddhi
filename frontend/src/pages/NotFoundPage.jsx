import { useNavigate } from 'react-router-dom';

/* ── Vriddhi 404 — Not Found Page ───────────────────── */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.viewport}>
      {/* ── Floating card container ── */}
      <div style={styles.card}>

        {/* ── Icon ── */}
        <div style={styles.iconWrapper}>
          <span
            className="material-symbols-outlined"
            style={styles.icon}
            aria-hidden="true"
          >
            explore_off
          </span>
        </div>

        {/* ── Error code badge ── */}
        <span style={styles.badge}>404</span>

        {/* ── Heading ── */}
        <h1 style={styles.heading}>Lost in the Shop?</h1>

        {/* ── Body copy ── */}
        <p style={styles.body}>
          We couldn&apos;t find the page you&apos;re looking for.
          <br />
          It might have been moved or doesn&apos;t exist anymore.
        </p>

        {/* ── Divider ── */}
        <div style={styles.divider} />

        {/* ── CTA Button ── */}
        <button
          id="back-to-dashboard-btn"
          style={styles.btn}
          onClick={() => navigate('/dashboard')}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#c55200';
            e.currentTarget.style.transform  = 'translateY(-2px)';
            e.currentTarget.style.boxShadow  =
              '0 8px 24px rgba(160, 65, 0, 0.40)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#a04100';
            e.currentTarget.style.transform  = 'translateY(0)';
            e.currentTarget.style.boxShadow  =
              '0 4px 14px rgba(160, 65, 0, 0.28)';
          }}
        >
          <span
            className="material-symbols-outlined"
            style={styles.btnIcon}
            aria-hidden="true"
          >
            home
          </span>
          Back to Dashboard
        </button>

        {/* ── Subtle footer hint ── */}
        <p style={styles.hint}>
          Vriddhi &middot; Smart Business Ledger
        </p>
      </div>

      {/* ── Decorative background blobs ── */}
      <div style={{ ...styles.blob, ...styles.blobTL }} />
      <div style={{ ...styles.blob, ...styles.blobBR }} />
    </div>
  );
}

/* ─── Inline styles (keeps component self-contained) ──── */
const styles = {
  viewport: {
    minHeight:      '100vh',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '1.5rem',
    background:     'var(--background, #fbf9f9)',
    position:       'relative',
    overflow:       'hidden',
    fontFamily:     "'Inter', system-ui, sans-serif",
  },

  card: {
    position:        'relative',
    zIndex:          2,
    background:      '#ffffff',
    borderRadius:    '20px',
    boxShadow:       '0 10px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05)',
    padding:         'clamp(2rem, 6vw, 3.5rem)',
    maxWidth:        '480px',
    width:           '100%',
    textAlign:       'center',
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'center',
    gap:             '0',
  },

  iconWrapper: {
    width:          '96px',
    height:         '96px',
    borderRadius:   '50%',
    background:     'linear-gradient(135deg, #fff4ef 0%, #ffe8d9 100%)',
    border:         '2px solid #ffdbcc',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   '1.25rem',
  },

  icon: {
    fontSize:              '48px',
    color:                 '#ff6b00',
    fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48",
  },

  badge: {
    display:       'inline-block',
    background:    'linear-gradient(135deg, #ff6b00 0%, #a04100 100%)',
    color:         '#ffffff',
    fontSize:      '0.70rem',
    fontWeight:    '700',
    letterSpacing: '0.12em',
    padding:       '0.25rem 0.75rem',
    borderRadius:  '100px',
    marginBottom:  '1rem',
    textTransform: 'uppercase',
  },

  heading: {
    fontSize:   'clamp(1.6rem, 4vw, 2rem)',
    fontWeight: '700',
    color:      '#1b1c1c',
    margin:     '0 0 0.75rem',
    lineHeight: '1.2',
  },

  body: {
    fontSize:   '0.95rem',
    color:      '#5f5e5e',
    lineHeight: '1.65',
    margin:     '0 0 1.5rem',
    maxWidth:   '360px',
  },

  divider: {
    width:        '100%',
    height:       '1px',
    background:   'var(--outline-variant, #e2bfb0)',
    marginBottom: '1.5rem',
    opacity:      '0.6',
  },

  btn: {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '0.5rem',
    background:    '#a04100',
    color:         '#ffffff',
    border:        'none',
    borderRadius:  '10px',
    padding:       '0.75rem 1.75rem',
    fontSize:      '0.95rem',
    fontWeight:    '600',
    cursor:        'pointer',
    boxShadow:     '0 4px 14px rgba(160, 65, 0, 0.28)',
    transition:    'background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease',
    marginBottom:  '1.75rem',
    letterSpacing: '0.01em',
    fontFamily:    "'Inter', system-ui, sans-serif",
  },

  btnIcon: {
    fontSize:              '20px',
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },

  hint: {
    fontSize:      '0.75rem',
    color:         '#9e9e9e',
    margin:        '0',
    letterSpacing: '0.02em',
  },

  /* ── decorative background orbs ── */
  blob: {
    position:      'absolute',
    borderRadius:  '50%',
    pointerEvents: 'none',
    zIndex:        1,
    filter:        'blur(60px)',
    opacity:       '0.35',
  },
  blobTL: {
    width:      '320px',
    height:     '320px',
    background: 'radial-gradient(circle, #ff6b00 0%, transparent 70%)',
    top:        '-120px',
    left:       '-100px',
  },
  blobBR: {
    width:      '280px',
    height:     '280px',
    background: 'radial-gradient(circle, #ffb693 0%, transparent 70%)',
    bottom:     '-100px',
    right:      '-80px',
  },
};
