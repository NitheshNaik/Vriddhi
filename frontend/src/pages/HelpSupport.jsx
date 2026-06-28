import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Help & Support FAQ data ──────────────────────────── */
const FAQS = [
  {
    q: 'Why are my recent sales not reflecting on the dashboard immediately?',
    a: 'The core ledger uses highly optimized atomic database synchronization. If you are on a weak network connection, the system pipelines your sales cache locally and pushes them to the cloud database the moment your network stabilizes. Try a quick pull-to-refresh to force a shard synchronization.',
  },
  {
    q: 'Can I edit a transaction after clicking "Confirm & Finish"?',
    a: 'Once a transaction payload is committed to the main cluster database, it cannot be edited directly from the home feed to preserve ledger integrity.',
  },
  {
    q: 'What if an item price changes on the fly?',
    a: "You don't need to change your master product catalog metadata. The app supports dynamic inline pricing, simply type the new price into the item card during checkout, and the analytics engine will log the exact revenue spike accurately without altering your default configurations.",
  },
];

/* ── System status data ───────────────────────────────── */
const STATUS_ITEMS = [
  {
    icon: 'cloud',
    label: 'Cloud Cluster Availability',
    value: '99.98% Uptime',
    type: 'online',
  },
  {
    icon: 'speed',
    label: 'API Endpoint Latency',
    value: '~45ms (Optimized Edge Nodes)',
    type: 'neutral',
  },
  {
    icon: 'lock',
    label: 'Data Encryption Standard',
    value: 'AES-256 Bit Secure Ledger Vault',
    type: 'secure',
  },
];

/* ── FAQ Accordion Item ───────────────────────────────── */
function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--surface-variant)',
      background: isOpen ? '#f5f3f3' : 'var(--surface-container-lowest)',
      borderLeft: isOpen ? '3px solid var(--primary)' : '3px solid transparent',
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      {/* Question row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          cursor: 'pointer', gap: 10, textAlign: 'left',
        }}
        aria-expanded={isOpen}
      >
        <span style={{
          fontSize: '0.85rem', fontWeight: 600,
          color: 'var(--on-surface)', lineHeight: 1.45, flex: 1,
        }}>
          {faq.q}
        </span>
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 20, color: isOpen ? 'var(--primary)' : 'var(--secondary)',
            flexShrink: 0, marginTop: 1,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease, color 0.25s',
          }}
        >
          expand_more
        </span>
      </button>

      {/* Answer (animated expand) */}
      <div style={{
        maxHeight: isOpen ? 400 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{
          padding: '0 16px 16px',
          fontSize: '0.82rem',
          color: 'var(--secondary)',
          lineHeight: 1.65,
        }}>
          {faq.a}
        </div>
      </div>
    </div>
  );
}

/* ── Help & Support View ──────────────────────────────── */
export default function HelpSupport() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => setOpenFaq(prev => (prev === idx ? null : idx));

  const statusColor = (type) => {
    if (type === 'online')  return '#2e7d32';
    if (type === 'secure')  return '#1565c0';
    return 'var(--secondary)';
  };

  return (
    <div className="fade-in">
      {/* ── Sticky sub-header ─────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 24, paddingBottom: 16,
        borderBottom: '1px solid var(--surface-variant)',
      }}>
        <button
          id="help-back-btn"
          onClick={() => navigate('/profile')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 'var(--radius-full)',
            color: 'var(--on-surface)',
            background: 'var(--surface-container)',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-high)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--surface-container)'}
          aria-label="Back to profile"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>
          Help &amp; Support
        </h2>
      </div>

      {/* ── Section 1: FAQs ───────────────────────────────── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10, paddingLeft: 2,
        }}>
          Frequently Asked Questions
        </div>
        <div style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--surface-variant)',
          boxShadow: 'var(--shadow)',
        }}>
          {FAQS.map((faq, idx) => (
            <FaqItem
              key={idx}
              faq={faq}
              isOpen={openFaq === idx}
              onToggle={() => toggleFaq(idx)}
            />
          ))}
        </div>
      </section>

      {/* ── Section 2: System Status Grid ─────────────────── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10, paddingLeft: 2,
        }}>
          System Status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STATUS_ITEMS.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: 'var(--surface-container-lowest)',
                border: '1px solid var(--surface-variant)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 14px',
                boxShadow: 'var(--shadow)',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius)',
                background: 'var(--surface-container)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--secondary)' }}>{item.icon}</span>
              </div>

              {/* Label + value */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 500, marginBottom: 3 }}>
                  {item.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  {item.type === 'online' && (
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#2e7d32', display: 'inline-block',
                      flexShrink: 0, marginRight: 6,
                    }} />
                  )}
                  <span style={{
                    fontSize: '0.82rem', fontWeight: 700,
                    color: statusColor(item.type),
                    lineHeight: 1.3,
                  }}>
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Contact Card ────────────────────────── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10, paddingLeft: 2,
        }}>
          Contact &amp; Support
        </div>
        <div style={{
          background: 'var(--surface-container-lowest)',
          border: '1px solid var(--outline-variant)',
          borderTop: '3px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Admin note */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, color: 'var(--primary)', flexShrink: 0, marginTop: 1 }}
            >
              build
            </span>
            <p style={{
              margin: 0, fontSize: '0.8rem',
              color: 'var(--on-surface)', lineHeight: 1.6, fontWeight: 500,
            }}>
              System Administrator Note: If you experience an unhandled exception error, a localized database timeout, or if an OTP verification email gets trapped in your mail network's spam filter rules, do not worry. Please flag the issue directly with our technical core infrastructure team.
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--surface-variant)', margin: '0 0 14px' }} />

          {/* Email link */}
          <a
            id="help-email-link"
            href="mailto:nitheshbnaik@gmail.com"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface-container-low)',
              border: '1px solid var(--outline-variant)',
              borderRadius: 'var(--radius)',
              padding: '11px 14px',
              textDecoration: 'none',
              marginBottom: 12,
              transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)', flexShrink: 0 }}>
              mail
            </span>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                nitheshbnaik@gmail.com
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--secondary)', marginTop: 1 }}>
                Tap to open your email client
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary-fixed-dim)', marginLeft: 'auto' }}>
              open_in_new
            </span>
          </a>

          {/* Response time */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 500,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
            Response Turnaround Window: <strong style={{ color: 'var(--on-surface)' }}>Within 12 Hours</strong>
          </div>
        </div>
      </section>
    </div>
  );
}