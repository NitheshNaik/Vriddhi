/* ── App Version & System Info View ──────────────────── */
import { useNavigate } from 'react-router-dom';

/* ── Build specification data ────────────────────────── */
const BUILD_SPECS = [
  { key: 'Build Target',      value: 'MERN Native Web / Progressive Hybrid' },
  { key: 'Database Protocol', value: 'MongoDB API Gateway v6.0' },
  { key: 'State Engine',      value: 'TanStack Query Client Core' },
  { key: 'Release Date',      value: 'June 2026' },
];

/* ── Release milestone bullets ───────────────────────── */
const MILESTONES = [
  {
    icon: 'inventory_2',
    title: 'Zero-Configuration Catalog Engine',
    body: 'Complete removal of inventory overhead and categorization constraints. Add items smoothly with direct flat-list indexing.',
  },
  {
    icon: 'image',
    title: 'Network-Independent Image Streaming',
    body: 'Implemented automated memory-buffer compression. Media assets are transcoded into secure Base64 text payloads stored within the database cluster, enabling lightning-fast mobile browser rendering.',
  },
  {
    icon: 'lock',
    title: 'Cryptographic Guardrails',
    body: 'Enforced strict authentication protocol rules requiring complex alpha-numeric passwords alongside safe, time-locked OTP verification channels via transactional mail layers.',
  },
  {
    icon: 'analytics',
    title: 'Real-time Analytics Sharding',
    body: 'Refactored the core calculation engine to run highly optimized aggregations directly on MongoDB cluster schemas, delivering instant dynamic revenue insight metrics.',
  },
];

/* ── Spec Row ─────────────────────────────────────────── */
function SpecRow({ label, value, isLast }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      gap: 12, padding: '11px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--surface-variant)',
    }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 500, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        fontSize: '0.75rem', fontWeight: 700,
        color: 'var(--on-surface)', textAlign: 'right', lineHeight: 1.4,
      }}>
        {value}
      </span>
    </div>
  );
}

/* ── Milestone Item ───────────────────────────────────── */
function MilestoneItem({ icon, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--radius)',
        background: '#FF6B0015',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#FF6B00' }}>
          {icon}
        </span>
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 3, lineHeight: 1.35 }}>
          {title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', lineHeight: 1.65 }}>
          {body}
        </div>
      </div>
    </div>
  );
}

/* ── AppVersion View ──────────────────────────────────── */
export default function AppVersion() {
  const navigate = useNavigate();
  return (
    <div className="fade-in">

      {/* ── Navigation Sub-Header ──────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 24, paddingBottom: 16,
        borderBottom: '1px solid var(--surface-variant)',
      }}>
        <button
          id="appversion-back-btn"
          onClick={() => navigate('/profile')}
          style={{
            background: 'var(--surface-container)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 'var(--radius-full)',
            color: 'var(--on-surface)', flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-high)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--surface-container)'}
          aria-label="Back to profile"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.2 }}>
            System Information
          </h2>
          <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--secondary)', marginTop: 2 }}>
            Vriddhi production deployment
          </p>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--primary)', opacity: 0.75 }}>
          terminal
        </span>
      </div>

      {/* ── Section 1: Hero Version Badge ─────────────────── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{
          background: 'var(--surface-container-lowest)',
          border: '1px solid var(--surface-variant)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow)',
          padding: '28px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 10,
        }}>
          {/* App icon ring */}
          <div style={{
            width: 68, height: 68, borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #FF6B0020 0%, #FF6B0008 100%)',
            border: '2px solid #FF6B0030',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 4,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 34, color: '#FF6B00' }}>
              terminal
            </span>
          </div>

          {/* App name */}
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--secondary)' }}>
            Vriddhi
          </div>

          {/* Version string — primary visual anchor */}
          <div style={{
            fontSize: '3rem', fontWeight: 800,
            color: 'var(--on-surface)',
            letterSpacing: '-0.03em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>
            v1.0.0
          </div>

          {/* Stable capsule badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: '#0a7a4010',
            border: '1px solid #0a7a4035',
            borderRadius: 999,
            padding: '4px 12px',
            marginTop: 2,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#2e7d32',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2e7d32', letterSpacing: '0.04em' }}>
              Production Stable
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Build Specification Sheet ──────────── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10, paddingLeft: 2,
        }}>
          Technical Build Specifications
        </div>
        <div style={{
          background: 'var(--surface-container-lowest)',
          border: '1px solid var(--surface-variant)',
          borderRadius: 'var(--radius-lg)',
          padding: '0 16px',
          boxShadow: 'var(--shadow)',
        }}>
          {BUILD_SPECS.map((spec, idx) => (
            <SpecRow
              key={spec.key}
              label={spec.key}
              value={spec.value}
              isLast={idx === BUILD_SPECS.length - 1}
            />
          ))}
        </div>
      </section>

      {/* ── Section 3: Release Notes & Update Card ────────── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10, paddingLeft: 2,
        }}>
          Release Notes Log
        </div>
        <div style={{
          background: 'var(--surface-container-lowest)',
          border: '1px solid var(--surface-variant)',
          borderTop: '3px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Release header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius)',
              background: '#FF6B0015',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#FF6B00' }}>
                rocket_launch
              </span>
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.2 }}>
                Engine Release Summary
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--secondary)', marginTop: 2 }}>
                Build 1.0.0 — Initial Stable Baseline
              </div>
            </div>
          </div>

          {/* Intro blurb */}
          <p style={{
            margin: '0 0 16px',
            fontSize: '0.78rem', color: 'var(--secondary)',
            lineHeight: 1.65,
          }}>
            Welcome to the initial stable baseline deployment of Vriddhi. This production release launches our core hyper-local business architecture, optimized for immediate field execution.
          </p>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--surface-variant)', margin: '0 0 14px' }} />

          {/* Milestones header */}
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--secondary)', marginBottom: 12,
          }}>
            Core Milestones Shipped
          </div>

          {/* Milestone list */}
          {MILESTONES.map((m) => (
            <MilestoneItem key={m.title} {...m} />
          ))}

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--surface-variant)', margin: '4px 0 14px' }} />

          {/* Up-to-date status button */}
          <button
            id="appversion-update-btn"
            disabled
            style={{
              width: '100%', height: 44,
              background: '#f0faf4',
              border: '1px solid #b2dfdb',
              borderRadius: 'var(--radius-lg)',
              color: '#2e7d50',
              fontWeight: 700, fontSize: '0.82rem',
              cursor: 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              letterSpacing: '0.01em',
              opacity: 0.85,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
              check_circle
            </span>
            System Up to Date
          </button>
        </div>
      </section>

    </div>
  );
}
