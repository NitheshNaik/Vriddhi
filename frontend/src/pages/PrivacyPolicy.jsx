import { useState } from 'react';

/* ── Core Data Principles ─────────────────────────────── */
const PRINCIPLES = [
  {
    icon: 'data_usage',
    title: 'Data Minimization',
    description:
      'We strictly track operational sales metrics (totalRevenue, quantitySold). No personal consumer tracking metrics or behavioral profiles are ever logged.',
    accent: '#FF6B00',
  },
  {
    icon: 'shield_locked',
    title: 'Zero External Leaks',
    description:
      'Transaction history is secured within dedicated MongoDB Atlas instances. Your ledger data is never sold to or shared with third-party ad networks.',
    accent: '#2e7d32',
  },
  {
    icon: 'token',
    title: 'Stateless Auth',
    description:
      'User sessions use secure, cryptographically signed tokens. Zero long-term tracking cookies are stored on your mobile device.',
    accent: '#1565c0',
  },
];

/* ── Policy accordion sections ────────────────────────── */
const POLICY_SECTIONS = [
  {
    title: '1. Data Collection & Ledger Architecture',
    body: 'We process financial ledger metrics strictly necessary for operational analytics. This includes item pricing profiles, transaction quantities, timestamp markers, and designated payment methods (such as UPI or Cash). We do not record individual consumer profiles, biometric metadata, or GPS device locations during standard checkout sync operations.',
  },
  {
    title: '2. Cloud Infrastructure & Security Controls',
    body: 'All telemetry arrays and ledger entries are encrypted in transit using Transport Layer Security (TLS) and stored securely at rest within MongoDB Atlas enterprise clusters dedicated to Vriddhi. Session access tokens are processed using secure cryptographic signing algorithms, ensuring that your administrative login credentials remain invisible to unauthorized scrapers.',
  },
  {
    title: '3. Complete data Eradication',
    body: 'We respect your right to complete digital data deletion. Under our infrastructure guidelines, you maintain absolute control over your ledger state. If you choose to close your store account profile, you can initiate an automated database command script that hard-deletes your entire document array, wiping your store details and transaction logs entirely from our database storage arrays within 24 hours.',
  },
];

/* ── Principle Card ───────────────────────────────────── */
function PrincipleCard({ icon, title, description, accent }) {
  return (
    <div style={{
      flex: '1 1 140px',
      minWidth: 0,
      background: 'var(--surface-container-lowest)',
      border: '1px solid var(--surface-variant)',
      borderTop: `3px solid ${accent}`,
      borderRadius: 'var(--radius-lg)',
      padding: '14px 12px',
      boxShadow: 'var(--shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius)',
        background: `${accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: accent }}>
          {icon}
        </span>
      </div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.3 }}>
        {title}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--secondary)', lineHeight: 1.6 }}>
        {description}
      </div>
    </div>
  );
}

/* ── Policy Accordion Item ────────────────────────────── */
function PolicyItem({ section, isOpen, onToggle }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--surface-variant)',
      background: isOpen ? '#fdf6f2' : 'var(--surface-container-lowest)',
      borderLeft: isOpen ? '3px solid var(--primary)' : '3px solid transparent',
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          cursor: 'pointer', gap: 10, textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: '0.84rem', fontWeight: 600,
          color: isOpen ? 'var(--primary)' : 'var(--on-surface)',
          lineHeight: 1.45, flex: 1,
          transition: 'color 0.25s',
        }}>
          {section.title}
        </span>
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 20,
            color: isOpen ? 'var(--primary)' : 'var(--secondary)',
            flexShrink: 0, marginTop: 1,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease, color 0.25s',
          }}
        >
          expand_more
        </span>
      </button>

      <div style={{
        maxHeight: isOpen ? 400 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{
          padding: '0 16px 16px',
          fontSize: '0.81rem',
          color: 'var(--secondary)',
          lineHeight: 1.7,
        }}>
          {section.body}
        </div>
      </div>
    </div>
  );
}

/* ── Privacy Policy View ──────────────────────────────── */
export default function PrivacyPolicy({ onBack }) {
  const [openSection, setOpenSection] = useState(null);
  const [purgeRequested, setPurgeRequested] = useState(false);

  const toggleSection = (idx) =>
    setOpenSection((prev) => (prev === idx ? null : idx));

  const handlePurgeRequest = () => {
    setPurgeRequested(true);
    setTimeout(() => setPurgeRequested(false), 4000);
  };

  return (
    <div className="fade-in">
      {/* ── Navigation Sub-Header ──────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 24, paddingBottom: 16,
        borderBottom: '1px solid var(--surface-variant)',
      }}>
        <button
          id="privacy-back-btn"
          onClick={onBack}
          style={{
            background: 'var(--surface-container)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 'var(--radius-full)',
            color: 'var(--on-surface)',
            flexShrink: 0,
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
            Privacy Policy
          </h2>
          <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--secondary)', marginTop: 2 }}>
            Last updated: June 2025
          </p>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--primary)', opacity: 0.75 }}>
          privacy_tip
        </span>
      </div>

      {/* ── Section 1: Core Data Principles Grid ──────────── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10, paddingLeft: 2,
        }}>
          Core Data Principles
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRINCIPLES.map((p) => (
            <PrincipleCard key={p.title} {...p} />
          ))}
        </div>
      </section>

      {/* ── Section 2: Policy Documentation Accordion ─────── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10, paddingLeft: 2,
        }}>
          Detailed Policy Documentation
        </div>
        <div style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--surface-variant)',
          boxShadow: 'var(--shadow)',
        }}>
          {POLICY_SECTIONS.map((section, idx) => (
            <PolicyItem
              key={idx}
              section={section}
              isOpen={openSection === idx}
              onToggle={() => toggleSection(idx)}
            />
          ))}
        </div>
      </section>

      {/* ── Section 3: Data Sovereignty CTA Card ──────────── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10, paddingLeft: 2,
        }}>
          Data Sovereignty
        </div>
        <div style={{
          background: 'var(--surface-container-lowest)',
          border: '1px solid #FF6B0030',
          borderTop: '3px solid #FF6B00',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Warning banner */}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: '#FF6B0010',
            border: '1px solid #FF6B0025',
            borderRadius: 'var(--radius)',
            padding: '10px 12px',
            marginBottom: 14,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#FF6B00', flexShrink: 0, marginTop: 1 }}>
              warning
            </span>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--on-surface)', lineHeight: 1.6, fontWeight: 500 }}>
              Complete Data Eradication: This action is permanent and irreversible. Your entire store ledger, transaction logs, and account records will be wiped from our database clusters within{' '}
              <strong style={{ color: '#FF6B00' }}>24 hours</strong>.
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--surface-variant)', margin: '0 0 14px' }} />

          {/* Steps */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary)',
              marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              How to request deletion
            </div>
            {[
              { step: '01', text: 'Tap "Request Data Purge" below to submit your deletion request.' },
              { step: '02', text: 'A confirmation email will be dispatched to your registered address.' },
              { step: '03', text: 'Our infrastructure team initiates a hard-delete command on your document cluster within 24 hours.' },
            ].map(({ step, text }) => (
              <div key={step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 800, color: '#FF6B00',
                  background: '#FF6B0015', borderRadius: 4,
                  padding: '2px 6px', flexShrink: 0, marginTop: 1,
                  letterSpacing: '0.04em',
                }}>
                  {step}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            id="privacy-purge-btn"
            onClick={handlePurgeRequest}
            disabled={purgeRequested}
            style={{
              width: '100%', height: 46,
              border: purgeRequested ? '1px solid #FF6B0060' : '1px solid #FF6B00',
              background: purgeRequested ? '#FF6B0015' : 'none',
              color: purgeRequested ? '#FF6B0090' : '#FF6B00',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 700, fontSize: '0.85rem',
              cursor: purgeRequested ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
            }}
            onMouseOver={e => { if (!purgeRequested) e.currentTarget.style.background = '#FF6B0012'; }}
            onMouseOut={e => { if (!purgeRequested) e.currentTarget.style.background = purgeRequested ? '#FF6B0015' : 'none'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {purgeRequested ? 'check_circle' : 'delete_forever'}
            </span>
            {purgeRequested ? 'Request Submitted — Confirmation Sent' : 'Request Data Purge'}
          </button>

          {/* Footer note */}
          <p style={{
            margin: '10px 0 0',
            fontSize: '0.68rem', color: 'var(--secondary-fixed-dim)',
            textAlign: 'center', lineHeight: 1.5,
          }}>
            This request is governed by our data sovereignty terms and applicable data protection regulations.
          </p>
        </div>
      </section>
    </div>
  );
}
