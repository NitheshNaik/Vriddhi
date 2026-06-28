import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError } from '../components/Toast';

/* ── Payment Method Modal ─────────────────────────────── */
function PaymentModal({ onConfirm, onCancel }) {
  const [method, setMethod] = useState('cash');

  return (
    <>
      {/* Backdrop overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1040,
        background: 'rgba(0,0,0,0.45)',
      }}></div>
      
      {/* Modal Container */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1050,
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 20px 24px',
        width: '90%',
        maxWidth: 360,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        animation: 'popIn 0.2s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>
            Select Payment Method
          </span>
          <button onClick={onCancel} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--secondary)', padding: 4, borderRadius: 'var(--radius-full)',
            display: 'flex', alignItems: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        {/* Payment Options */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {/* UPI */}
          <button
            onClick={() => setMethod('upi')}
            style={{
              flex: 1, padding: '16px 8px',
              border: `2px solid ${method === 'upi' ? 'var(--primary-container)' : 'var(--surface-variant)'}`,
              borderRadius: 'var(--radius-lg)',
              background: method === 'upi' ? 'rgba(255,107,0,0.07)' : 'var(--surface-container-lowest)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: 32,
              color: method === 'upi' ? 'var(--primary-container)' : 'var(--secondary)',
            }}>
              qr_code_2
            </span>
            <span style={{
              fontSize: '0.875rem', fontWeight: 600,
              color: method === 'upi' ? 'var(--primary-container)' : 'var(--on-surface)',
            }}>
              UPI
            </span>
          </button>

          {/* Cash */}
          <button
            onClick={() => setMethod('cash')}
            style={{
              flex: 1, padding: '16px 8px',
              border: `2px solid ${method === 'cash' ? 'var(--primary-container)' : 'var(--surface-variant)'}`,
              borderRadius: 'var(--radius-lg)',
              background: method === 'cash' ? 'rgba(255,107,0,0.07)' : 'var(--surface-container-lowest)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: 32,
              color: method === 'cash' ? 'var(--primary-container)' : 'var(--secondary)',
            }}>
              payments
            </span>
            <span style={{
              fontSize: '0.875rem', fontWeight: 600,
              color: method === 'cash' ? 'var(--primary-container)' : 'var(--on-surface)',
            }}>
              Cash
            </span>
          </button>
        </div>

        {/* Confirm & Finish */}
        <button
          className="btn btn-orange w-100"
          style={{ height: 48, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.02em', borderRadius: 'var(--radius-lg)', marginBottom: 8 }}
          onClick={() => onConfirm(method)}
        >
          Confirm &amp; Finish
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          style={{
            display: 'block', width: '100%', background: 'none', border: 'none',
            color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 500,
            cursor: 'pointer', padding: '8px 0', textAlign: 'center',
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* ── Item Card ────────────────────────────────────────── */
function ItemCard({ item, onSell }) {
  const [qty, setQty] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState(item.sellingPrice);
  const [showModal, setShowModal] = useState(false);
  const [selling, setSelling] = useState(false);

  const handleConfirmSale = () => setShowModal(true);

  const handlePaymentConfirm = async (paymentMethod) => {
    setShowModal(false);
    setSelling(true);
    await onSell(item._id, qty, pricePerUnit, paymentMethod);
    setQty(1);
    setPricePerUnit(item.sellingPrice);
    setSelling(false);
  };

  return (
    <>
      <div className="item-card fade-in">

        {/* ── Top Row: Image + Name (left) | Price label + input (right) ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>

          {/* Left: image + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
            <div style={{
              width: 48, height: 48, flexShrink: 0,
              borderRadius: 'var(--radius)',
              background: 'var(--surface-container-low)',
              border: '1px solid var(--surface-variant)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.photo ? (
                <img 
                  src={item.photo} 
                  alt={item.name} 
                  loading="lazy"
                  onError={(e) => {
                    // Fallback placeholder icon logic if a string is corrupt or missing
                    e.target.src = 'https://placehold.co/150?text=No+Image';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span className="material-symbols-outlined"
                  style={{ fontSize: 24, color: 'var(--secondary-fixed-dim)' }}>
                  inventory_2
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--on-surface)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {item.name}
              </div>
            </div>
          </div>

          {/* Right: price label + editable input */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0, marginLeft: 8 }}>
            <div style={{
              fontSize: '0.6rem', fontWeight: 600,
              color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Price (₹)
            </div>
            <input
              type="number"
              min="0"
              step="1"
              value={pricePerUnit}
              onChange={e => setPricePerUnit(parseFloat(e.target.value) || 0)}
              className="form-control"
              style={{
                width: 80, height: 34, paddingLeft: 8, paddingRight: 6, fontSize: '0.85rem', fontWeight: 600, textAlign: 'right', background: '#f5f3f3',
                backgroundColor: '#f5f3f3', borderRadius: '6px'
              }}
              ref={el => {
                if (el) {
                  el.style.setProperty('background-color', '#f5f3f3', 'important');
                  el.style.setProperty('border-radius', '6px', 'important');
                }
              }}
              aria-label="Price per unit"
            />
          </div>
        </div>

        {/* ── Bottom Row: Counter (left) | Confirm Sale button (right) ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 10 }}>

          {/* Quantity counter */}
          <div className="counter" style={{ margin: 0 }}>
            <button
              className="counter__btn"
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>remove</span>
            </button>
            <span className="counter__value">{qty}</span>
            <button
              className="counter__btn"
              onClick={() => setQty(q => q + 1)}
              aria-label="Increase quantity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            </button>
          </div>

          {/* Confirm Sale button */}
          <button
            className="btn btn-orange"
            style={{ height: 40, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', paddingLeft: 14, paddingRight: 14, borderRadius: 'var(--radius)', flexShrink: 0 }}
            onClick={handleConfirmSale}
            disabled={selling}
          >
            {selling ? (
              <span className="sk-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : 'Confirm Sale'}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <PaymentModal
          onConfirm={handlePaymentConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
}

/* ── Dashboard Page ───────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [greetingShown, setGreetingShown] = useState(false);

  // Auto-vanish greeting: show for 3.5 s then fade + collapse
  useEffect(() => {
    setGreetingShown(true);
    const fadeTimer = setTimeout(() => setGreetingVisible(false), 3500);
    return () => clearTimeout(fadeTimer);
  }, []); // runs once on mount

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data } = await apiClient.get('/items');
      return data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const saleMutation = useMutation({
    mutationFn: ({ itemId, quantitySold, pricePerUnit, paymentMethod }) =>
      apiClient.post('/sales', { sales: [{ itemId, quantitySold, pricePerUnit, paymentMethod }] }),
    onSuccess: (_, vars) => {
      const item = items.find(i => i._id === vars.itemId);
      showSuccess(`Sale recorded: ${vars.quantitySold}× ${item?.name || 'item'} (${vars.paymentMethod.toUpperCase()})`);

      // ── Optimistic analytics update ───────────────────────────────────────
      // Immediately reflect the sale in the Reports cache so the user sees
      // updated revenue figures without waiting for a network round-trip.
      const addedRevenue = vars.pricePerUnit * vars.quantitySold;
      queryClient.setQueryData(['analytics'], (old) => {
        if (!old) return old;
        return {
          ...old,
          today: {
            revenue: (old.today?.revenue || 0) + addedRevenue,
            count:   (old.today?.count   || 0) + vars.quantitySold,
          },
          week: {
            revenue: (old.week?.revenue  || 0) + addedRevenue,
            count:   (old.week?.count    || 0) + vars.quantitySold,
          },
          month: {
            revenue: (old.month?.revenue || 0) + addedRevenue,
            count:   (old.month?.count   || 0) + vars.quantitySold,
          },
        };
      });

      // Invalidate so next background refetch corrects any rounding drift
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      // Invalidate historical views so they refetch on next visit
      queryClient.invalidateQueries({ queryKey: ['historical-week'] });
      queryClient.invalidateQueries({ queryKey: ['historical-month'] });
    },
    onError: (err) => showError(err.response?.data?.message || 'Failed to record sale.'),
  });

  const handleSell = (itemId, quantitySold, pricePerUnit, paymentMethod) =>
    saleMutation.mutateAsync({ itemId, quantitySold, pricePerUnit, paymentMethod });

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>

      {/* Quick Mark Sold */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="section-title mb-0">Quick Mark Sold</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{items.length} items</span>
        </div>

        {/* Search */}
        <div className="position-relative mb-3">
          <span className="material-symbols-outlined position-absolute" style={{ left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', fontSize: 20 }}>search</span>
          <input
            id="item-search"
            type="text"
            className="form-control"
            style={{ height: 44, paddingLeft: 40 }}
            placeholder="Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading && (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div className="sk-spinner" />
            <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginTop: 12 }}>Loading inventory...</p>
          </div>
        )}

        {isError && (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-state__icon">wifi_off</span>
            <div className="empty-state__title">Connection Error</div>
            <div className="empty-state__sub">Could not reach the server.</div>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-state__icon">inventory_2</span>
            <div className="empty-state__title">No items found</div>
            <div className="empty-state__sub">Go to the Inventory tab to add items.</div>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="row g-2">
            {filtered.map(item => (
              <div className="col-12" key={item._id}>
                <ItemCard item={item} onSell={handleSell} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}