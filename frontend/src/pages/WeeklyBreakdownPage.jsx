import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

/* ─── Payment Badge ──────────────────────────────────────── */
function PayBadge({ method }) {
  const m = (method || '').toLowerCase();
  const isUpi  = m === 'upi';
  const isCard = m === 'card';
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em',
    textTransform: 'uppercase',
    background: isUpi  ? 'rgba(255,107,0,0.12)'
               : isCard ? 'rgba(33,150,243,0.10)'
               :           'var(--surface-container)',
    color:      isUpi  ? 'var(--primary)'
               : isCard ? '#1565c0'
               :           'var(--secondary)',
    border:     isUpi  ? '1px solid rgba(255,107,0,0.25)'
               : isCard ? '1px solid rgba(33,150,243,0.20)'
               :           '1px solid var(--surface-variant)',
  };
  const icon = isUpi ? 'qr_code_2' : isCard ? 'credit_card' : 'payments';
  return (
    <span style={style}>
      <span className="material-symbols-outlined" style={{ fontSize: 10 }}>{icon}</span>
      {m || 'cash'}
    </span>
  );
}

/* ─── Transaction Row ────────────────────────────────────── */
function DrillRow({ sale, isLast }) {
  const fmtDate = (ts) =>
    new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Asia/Kolkata',
    });

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '10px 14px',
      borderBottom: isLast ? 'none' : '1px solid var(--surface-variant)',
      gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--radius)',
        background: 'var(--surface-container)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary)' }}>receipt_long</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {sale.quantitySold}× {sale.itemName}
        </div>
        <div style={{ fontSize: '0.66rem', color: 'var(--secondary)', marginTop: 2 }}>
          {fmtDate(sale.timestamp)}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface)' }}>
          ₹{sale.totalRevenue.toFixed(2)}
        </div>
        <div style={{ marginTop: 3 }}>
          <PayBadge method={sale.paymentMethod} />
        </div>
      </div>
    </div>
  );
}

/* ─── Payment Split Bar ──────────────────────────────────── */
function PaySplit({ split }) {
  const total = (split.upi || 0) + (split.cash || 0) + (split.card || 0);
  if (total === 0) return null;
  const upiPct  = ((split.upi  || 0) / total) * 100;
  const cashPct = ((split.cash || 0) / total) * 100;
  const cardPct = ((split.card || 0) / total) * 100;
  const fmt = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n.toFixed(0)}`;

  return (
    <div>
      <div style={{
        height: 6, borderRadius: 99, overflow: 'hidden',
        display: 'flex', background: 'var(--surface-variant)', marginBottom: 8,
      }}>
        {upiPct  > 0 && <div style={{ width: `${upiPct}%`,  background: '#FF6B00', transition: 'width 0.5s' }} />}
        {cardPct > 0 && <div style={{ width: `${cardPct}%`, background: '#1565c0', transition: 'width 0.5s' }} />}
        {cashPct > 0 && <div style={{ width: `${cashPct}%`, background: 'var(--secondary)', transition: 'width 0.5s' }} />}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'UPI',  value: split.upi  || 0, color: '#FF6B00' },
          { label: 'Cash', value: split.cash || 0, color: 'var(--secondary)' },
          ...(split.card > 0 ? [{ label: 'Card', value: split.card, color: '#1565c0' }] : []),
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 500 }}>
              {label}: <strong style={{ color: 'var(--on-surface)' }}>{fmt(value)}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Week Card ──────────────────────────────────────────── */
function WeekCard({ period, isOpen, onToggle, weekNum }) {
  const fmtK = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n.toFixed(2)}`;

  return (
    <div style={{
      border: '1px solid var(--surface-variant)',
      borderLeft: isOpen ? '3px solid var(--primary)' : '3px solid transparent',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-container-lowest)',
      boxShadow: 'var(--shadow)',
      overflow: 'hidden',
      transition: 'border-color 0.25s',
      marginBottom: 10,
    }}>
      {/* ── Collapsed header ── */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '14px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
        }}
      >
        {/* Week badge */}
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius)',
          background: isOpen ? '#FF6B0015' : 'var(--surface-container)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.25s',
        }}>
          <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.06em', color: isOpen ? 'var(--primary)' : 'var(--secondary)', textTransform: 'uppercase', lineHeight: 1 }}>
            WK
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isOpen ? 'var(--primary)' : 'var(--on-surface)', lineHeight: 1.1, transition: 'color 0.25s' }}>
            {weekNum}
          </span>
        </div>

        {/* Week label + stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.25 }}>
            {period.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: isOpen ? 'var(--primary)' : 'var(--on-surface)', letterSpacing: '-0.02em', transition: 'color 0.25s' }}>
              {fmtK(period.totalRevenue)}
            </span>
            <span style={{
              fontSize: '0.67rem', padding: '2px 8px', borderRadius: 999,
              background: 'var(--surface-container)', color: 'var(--secondary)', fontWeight: 600,
            }}>
              {period.totalQty} units
            </span>
          </div>
        </div>

        <span className="material-symbols-outlined" style={{
          fontSize: 20, color: isOpen ? 'var(--primary)' : 'var(--secondary)',
          flexShrink: 0,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease, color 0.25s',
        }}>
          expand_more
        </span>
      </button>

      {/* ── Expanded body ── */}
      <div style={{
        maxHeight: isOpen ? 9999 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ borderTop: '1px solid var(--surface-variant)', background: 'var(--surface-container-lowest)' }}>

          {/* Top Seller */}
          {period.topSeller && (
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--surface-variant)',
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#FF6B0006',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--secondary)', marginBottom: 2 }}>
                  Top Seller of the Week
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {period.topSeller.itemName}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ₹{period.topSeller.revenue.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--secondary)', marginTop: 1 }}>
                  {period.topSeller.qty} units
                </div>
              </div>
            </div>
          )}

          {/* Payment Split */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--surface-variant)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--secondary)', marginBottom: 8 }}>
              Payment Split
            </div>
            <PaySplit split={period.paymentSplit} />
          </div>

          {/* Transaction Ledger */}
          <div>
            <div style={{
              padding: '10px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid var(--surface-variant)',
              background: 'var(--surface-bright)',
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--secondary)' }}>
                Transaction Ledger
              </span>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                background: 'var(--primary)', color: 'white',
                padding: '2px 8px', borderRadius: 999,
              }}>
                {period.sales.length} entries
              </span>
            </div>
            {period.sales.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.78rem' }}>
                No transactions found.
              </div>
            ) : (
              <>
                {period.sales.map((sale, i) => (
                  <DrillRow key={sale._id || i} sale={sale} isLast={i === period.sales.length - 1} />
                ))}
                <div style={{
                  padding: '10px 16px',
                  background: 'var(--surface-container-low)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 500 }}>Period Total</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary)' }}>
                    ₹{period.totalRevenue.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Weekly Breakdown Page ──────────────────────────────── */
export default function WeeklyBreakdownPage() {
  const navigate = useNavigate();
  const [openPeriod, setOpenPeriod] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['historical-week'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/historical?type=week');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const togglePeriod = (key) =>
    setOpenPeriod((prev) => (prev === key ? null : key));

  // Extract ISO week number from periodKey like "2026-W26"
  const weekNum = (key) => key?.split('-W')[1] || '—';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* ── Sticky Nav Header ─────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--surface-variant)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <button
          id="weekly-back-btn"
          onClick={() => navigate('/reports')}
          style={{
            background: 'var(--surface-container)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', width: 36, height: 36,
            borderRadius: 'var(--radius-full)', color: 'var(--on-surface)',
            flexShrink: 0, transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-high)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--surface-container)'}
          aria-label="Back to reports"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.2 }}>
            Weekly History
          </h1>
          <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--secondary)', marginTop: 1 }}>
            Complete week-by-week breakdown
          </p>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--primary)', opacity: 0.7 }}>
          calendar_view_week
        </span>
      </div>

      {/* ── Page Content ──────────────────────────────────── */}
      <div style={{ padding: '20px 16px', maxWidth: 640, margin: '0 auto' }}>

        {/* Loading */}
        {isLoading && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div className="sk-spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Loading weekly history…</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-state__icon">bar_chart_off</span>
            <div className="empty-state__title">Could not load history</div>
            <div className="empty-state__sub">
              <button onClick={() => refetch()} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && data?.length === 0 && (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-state__icon">calendar_view_week</span>
            <div className="empty-state__title">No weekly data yet</div>
            <div className="empty-state__sub">Record your first sale to start building history.</div>
          </div>
        )}

        {/* Period Cards */}
        {!isLoading && !isError && data?.length > 0 && (
          <>
            <div style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--secondary)',
              marginBottom: 12, paddingLeft: 2,
            }}>
              {data.length} week{data.length !== 1 ? 's' : ''} on record
            </div>
            {data.map((period) => (
              <WeekCard
                key={period.periodKey}
                period={period}
                weekNum={weekNum(period.periodKey)}
                isOpen={openPeriod === period.periodKey}
                onToggle={() => togglePeriod(period.periodKey)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
