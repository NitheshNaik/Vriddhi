import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

/* ── Mini Bar Chart ────────────────────────────────────── */
function TrendChart({ trend }) {
  if (!trend || trend.length === 0) return null;

  const maxRevenue = Math.max(...trend.map(d => d.revenue), 1);
  const topTick = Math.ceil(maxRevenue / 100) * 100;
  const midTick = Math.round(topTick / 2);

  const fmtTick = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', height: 180 }}>

        {/* Y-axis */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', alignItems: 'flex-end',
          paddingBottom: 24, paddingRight: 8, flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: 'var(--secondary)', fontWeight: 500 }}>{fmtTick(topTick)}</span>
          <span style={{ fontSize: 10, color: 'var(--secondary)', fontWeight: 500 }}>{fmtTick(midTick)}</span>
          <span style={{ fontSize: 10, color: 'var(--secondary)', fontWeight: 500 }}>0</span>
        </div>

        {/* Bars + labels */}
        <div style={{
          flex: 1,
          borderLeft: '1px solid var(--surface-variant)',
          borderBottom: '1px solid var(--surface-variant)',
          display: 'flex', alignItems: 'flex-end',
          gap: 6, padding: '0 4px', position: 'relative',
          paddingBottom: 0,
        }}>
          {trend.map((d, i) => {
            const pct = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
            const isToday = i === trend.length - 1;
            return (
              <div key={d.date} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-end', height: '100%',
              }}>
                {/* Bar */}
                <div
                  title={`${d.label}: ₹${d.revenue.toFixed(2)}`}
                  style={{
                    width: '100%',
                    height: `${Math.max(pct, 2)}%`,
                    borderRadius: '4px 4px 0 0',
                    background: isToday ? 'var(--primary)' : 'var(--primary-fixed)',
                    opacity: isToday ? 1 : 0.6,
                    transition: 'height 0.6s cubic-bezier(.4,0,.2,1)',
                    cursor: 'default',
                  }}
                />
                {/* Day label */}
                <span style={{
                  fontSize: 10, color: 'var(--secondary)', fontWeight: 500,
                  marginTop: 4, textAlign: 'center', whiteSpace: 'nowrap',
                }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Payment badge ─────────────────────────────────────── */
function PayBadge({ method }) {
  const m = (method || '').toLowerCase();
  const isUpi  = m === 'upi';
  const isCard = m === 'card';
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
    textTransform: 'uppercase',
    background: isUpi  ? 'rgba(255,107,0,0.12)'
               : isCard ? 'rgba(33,150,243,0.1)'
               :           'var(--surface-container)',
    color:      isUpi  ? 'var(--primary)'
               : isCard ? '#1565c0'
               :           'var(--secondary)',
    border: isUpi  ? '1px solid rgba(255,107,0,0.25)'
           : isCard ? '1px solid rgba(33,150,243,0.2)'
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

/* ── Recent Sale Row (for the main Recent Sales list) ──── */
function SaleRow({ sale }) {
  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="sale-item">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="sale-item__icon">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>receipt_long</span>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>
            {sale.itemName}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
            {sale.quantitySold}× • {timeAgo(sale.timestamp)}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--on-surface)' }}>
          ₹{sale.totalRevenue.toFixed(2)}
        </div>
        <PayBadge method={sale.paymentMethod} />
      </div>
    </div>
  );
}

/* ── Drill-Down Transaction Row ───────────────────────── */
function DrillRow({ sale }) {
  // Format timestamp for India: "28 Jun 2026, 11:34 AM"
  const fmtDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '11px 14px',
      borderBottom: '1px solid var(--surface-variant)',
      gap: 10,
    }}>
      {/* Left icon */}
      <div style={{
        width: 34, height: 34, borderRadius: 'var(--radius)',
        background: 'var(--surface-container)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--secondary)' }}>receipt_long</span>
      </div>

      {/* Middle: timestamp + product details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {sale.quantitySold}× {sale.itemName}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--secondary)', marginTop: 2 }}>
          {fmtDate(sale.timestamp)}
        </div>
      </div>

      {/* Right: amount + payment badge */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--on-surface)' }}>
          ₹{sale.totalRevenue.toFixed(2)}
        </div>
        <div style={{ marginTop: 3 }}>
          <PayBadge method={sale.paymentMethod} />
        </div>
      </div>
    </div>
  );
}

/* ── Drill-Down Panel (animated expand) ───────────────── */
function DrillPanel({ title, icon, sales, totalRevenue, onClose }) {
  const isEmpty = !sales || sales.length === 0;

  return (
    <div
      className="sk-card overflow-hidden mb-3 fade-in"
      style={{ border: '2px solid var(--primary-fixed)', borderRadius: 'var(--radius-xl)' }}
    >
      {/* Panel header */}
      <div style={{
        padding: '12px 14px',
        background: 'linear-gradient(90deg, rgba(255,107,0,0.06), transparent)',
        borderBottom: '1px solid var(--surface-variant)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>{icon}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)' }}>{title}</span>
          {!isEmpty && (
            <span style={{
              fontSize: '0.68rem', background: 'var(--primary)', color: '#fff',
              padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600,
            }}>
              {sales.length} transactions
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isEmpty && (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
              ₹{Number(totalRevenue).toFixed(2)}
            </span>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', alignItems: 'center', padding: 2 }}
            aria-label="Close breakdown"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
      </div>

      {/* Transaction list */}
      {isEmpty ? (
        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36, opacity: 0.25 }}>receipt_long</span>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: 8 }}>No transactions in this period</div>
        </div>
      ) : (
        <>
          {sales.map((sale, i) => (
            <DrillRow key={sale._id || i} sale={sale} />
          ))}
          {/* Footer total */}
          <div style={{
            padding: '10px 14px',
            background: 'var(--surface-container-low)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
              ₹{Number(totalRevenue).toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default function Reports() {
  const [filter, setFilter] = useState('today');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics');
      return data;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  const stats = {
    today: { revenue: data?.today?.revenue ?? 0, count: data?.today?.count ?? 0 },
    week:  { revenue: data?.week?.revenue  ?? 0, count: data?.week?.count  ?? 0 },
    month: { revenue: data?.month?.revenue ?? 0, count: data?.month?.count ?? 0 },
  };

  const fmt  = (n) => `₹${Number(n).toFixed(2)}`;
  const fmtK = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : fmt(n);
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title">Sales Reports</h1>
      </div>

      {isLoading && (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <div className="sk-spinner" />
          <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginTop: 12 }}>Loading analytics...</p>
        </div>
      )}

      {isError && (
        <div className="empty-state">
          <span className="material-symbols-outlined empty-state__icon">bar_chart_off</span>
          <div className="empty-state__title">Could not load reports</div>
          <div className="empty-state__sub">
            <button onClick={() => refetch()} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* ── Stats Bento Grid ───────────────────────────────── */}
          <section className="mb-3">
            <div className="row g-2">

              {/* Today card (non-interactive) */}
              <div className="col-12">
                <div className="stats-card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)', borderColor: 'transparent' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
                      Today's Revenue
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)' }}>payments</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
                      {fmtK(stats.today.revenue)}
                    </span>
                    {stats.today.count > 0 && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 10px', borderRadius: 999, fontWeight: 500 }}>
                        +{stats.today.count} sold
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* This Week — navigate to /reports/week */}
              <div className="col-6">
                <button
                  id="drill-week-btn"
                  onClick={() => navigate('/reports/week')}
                  style={{ width: '100%', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                >
                  <div className="stats-card" style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                    <div className="d-flex justify-content-between">
                      <span className="stats-card__label">This Week</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary)' }}>
                        calendar_view_week
                      </span>
                    </div>
                    <span className="stats-card__value">{fmtK(stats.week.revenue)}</span>
                    <span className="stats-card__sub">{stats.week.count} units sold</span>
                    <div style={{ marginTop: 6, fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 11 }}>open_in_new</span>
                      Full History
                    </div>
                  </div>
                </button>
              </div>

              {/* This Month — navigate to /reports/month */}
              <div className="col-6">
                <button
                  id="drill-month-btn"
                  onClick={() => navigate('/reports/month')}
                  style={{ width: '100%', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                >
                  <div className="stats-card" style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                    <div className="d-flex justify-content-between">
                      <span className="stats-card__label">This Month</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--secondary)' }}>
                        calendar_month
                      </span>
                    </div>
                    <span className="stats-card__value">{fmtK(stats.month.revenue)}</span>
                    <span className="stats-card__sub">{stats.month.count} units sold</span>
                    <div style={{ marginTop: 6, fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 11 }}>open_in_new</span>
                      Full History
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>


          {/* ── Sales Trend Chart ──────────────────────────────── */}
          <section className="sk-card p-3 mb-3">
            <h2 className="section-title" style={{ fontSize: '1rem', marginBottom: 16 }}>
              Sales Trend (Last 7 Days)
            </h2>
            {data?.trend && data.trend.length > 0 ? (
              <TrendChart trend={data.trend} />
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, opacity: 0.3 }}>show_chart</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: 8 }}>No sales data yet</div>
              </div>
            )}
          </section>

          

          {/* ── Recent Sales ───────────────────────────────────── */}
          <section className="sk-card overflow-hidden mb-2">
            <div style={{
              padding: '12px 14px',
              borderBottom: '1px solid var(--surface-variant)',
              background: 'var(--surface-bright)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 className="section-title mb-0" style={{ fontSize: '1rem' }}>Recent Sales</h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>Last 10 transactions</span>
            </div>

            {!data?.recentSales?.length ? (
              <div className="empty-state">
                <span className="material-symbols-outlined empty-state__icon">receipt_long</span>
                <div className="empty-state__title">No sales recorded yet</div>
                <div className="empty-state__sub">Head to the Home tab to record your first sale.</div>
              </div>
            ) : (
              data.recentSales.map(sale => <SaleRow key={sale._id} sale={sale} />)
            )}
          </section>
        </>
      )}
    </>
  );
}