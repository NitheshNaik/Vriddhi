import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { showSuccess, showError } from '../components/Toast';
import { db } from '../api/db';

/* ─────────────────────────────────────────────────────────
   Add Item Form (inline, toggled by "Add New Item" button)
───────────────────────────────────────────────────────── */
function AddItemForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({ name: '', sellingPrice: '', photo: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileRef = useRef(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('sellingPrice', form.sellingPrice);
      if (photoFile) {
        fd.append('photo', photoFile);
      }
      const { data } = await apiClient.post('/items', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      showSuccess(`"${form.name}" added to inventory!`);
      setForm({ name: '', sellingPrice: '', photo: '' });
      setPhotoFile(null);
      setPreviewUrl('');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      onSuccess?.();
    },
    onError: (err) => showError(err.response?.data?.message || 'Failed to save item.'),
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.sellingPrice) {
      return showError('Name and selling price are required.');
    }
    mutation.mutate();
  };

  return (
    <div className="sk-card p-3 mb-3 fade-in" style={{ border: '2px solid var(--primary)', borderRadius: 'var(--radius-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--on-surface)' }}>New Item</span>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
        </button>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        {/* Item Name */}
        <div className="mb-3">
          <input
            id="inv-item-name"
            type="text"
            className="form-control"
            style={{ height: 48 }}
            placeholder="Item Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Selling Price */}
        <div className="mb-3">
          <div className="position-relative">
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-fixed-dim)', fontWeight: 600 }}>₹</span>
            <input
              id="inv-item-price"
              type="number"
              className="form-control"
              style={{ height: 48, paddingLeft: 24 }}
              placeholder="Selling Price"
              step="1"
              min="0"
              value={form.sellingPrice}
              onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))}
            />
          </div>
        </div>

        {/* Photo Upload */}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} id="inv-photo-file" onChange={handlePhotoChange} />
        <button type="button" id="inv-photo-btn" className="photo-upload-btn mb-3" onClick={() => fileRef.current?.click()}>
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="photo-upload-btn__preview" />
              <div className="photo-upload-btn__overlay">
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>add_a_photo</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Change</span>
              </div>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add_a_photo</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Add Photo</span>
            </>
          )}
        </button>

        {/* Photo URL alternative */}
        {!photoFile && (
          <div className="mb-3">
            <input
              id="inv-photo-url"
              type="url"
              className="form-control"
              style={{ height: 44 }}
              placeholder="Or paste image URL..."
              value={form.photo}
              onChange={e => setForm(f => ({ ...f, photo: e.target.value }))}
            />
          </div>
        )}

        <button
          id="inv-save-btn"
          type="submit"
          className="btn btn-primary w-100"
          style={{ height: 48, fontSize: '0.875rem', fontWeight: 600 }}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <span className="sk-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }}>add_circle</span>
              Save Item
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Delete Confirmation Modal
───────────────────────────────────────────────────────── */
function DeleteModal({ itemName, onConfirm, onCancel, isDeleting }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
    }}>
      <div style={{
        background: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 24px',
        width: '100%', maxWidth: 320,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        animation: 'popIn 0.2s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--error)' }}>delete_forever</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface)', textAlign: 'center', marginBottom: 8 }}>
          Delete Item?
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', textAlign: 'center', marginBottom: 24 }}>
          "<strong>{itemName}</strong>" will be permanently removed from your catalog.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            id="delete-cancel-btn"
            onClick={onCancel}
            style={{
              flex: 1, height: 44, border: '1px solid var(--surface-variant)',
              background: 'none', color: 'var(--secondary)',
              borderRadius: 'var(--radius-lg)', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem',
            }}
          >
            Cancel
          </button>
          <button
            id="delete-confirm-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1, height: 44,
              background: 'var(--error)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-lg)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
            }}
          >
            {isDeleting ? <span className="sk-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Lazy Photo Component
───────────────────────────────────────────────────────── */
function LazyPhoto({ id, name }) {
  const { data: photoData, isLoading } = useQuery({
    queryKey: ['photo', id],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/items/${id}/photo`);
        return data.photo;
      } catch (err) {
        return null;
      }
    },
    staleTime: Infinity, // Photos rarely change
  });

  if (isLoading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-container-high)' }}>
        <span className="sk-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
      </div>
    );
  }

  if (photoData) {
    return (
      <img 
        src={photoData} 
        alt={name} 
        loading="lazy"
        onError={(e) => { e.target.src = 'https://placehold.co/150?text=No+Image'; }}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
    );
  }

  // Fallback if no photo exists
  return <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--secondary-fixed-dim)' }}>inventory_2</span>;
}

/* ─────────────────────────────────────────────────────────
   Catalog Item Row (view + inline edit + delete trigger)
───────────────────────────────────────────────────────── */
function CatalogRow({ item, onDeleteRequest }) {
  const [editing, setEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(item.sellingPrice);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => apiClient.put(`/items/${item._id}`, {
      name: item.name,
      sellingPrice: parseFloat(editPrice),
    }),
    onSuccess: () => {
      showSuccess(`"${item.name}" price updated!`);
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setEditing(false);
    },
    onError: (err) => showError(err.response?.data?.message || 'Failed to update item.'),
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: '1px solid var(--surface-variant)',
    }}>
      {/* Thumbnail */}
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
          <LazyPhoto id={item._id} name={item.name} />
        )}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.name}
        </div>
      </div>

      {/* Price — static or editable */}
      {editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--secondary)', fontWeight: 600, fontSize: '0.8rem', pointerEvents: 'none',
            }}>₹</span>
            <input
              id={`edit-price-${item._id}`}
              type="number"
              min="0"
              step="1"
              value={editPrice}
              onChange={e => setEditPrice(e.target.value)}
              className="form-control"
              style={{ width: 80, height: 36, paddingLeft: 22, paddingRight: 6, fontSize: '0.85rem', fontWeight: 600, textAlign: 'right' }}
              autoFocus
            />
          </div>
          {/* Save check */}
          <button
            id={`save-edit-${item._id}`}
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            style={{
              width: 34, height: 34, flexShrink: 0,
              background: 'var(--primary)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Save price"
          >
            {updateMutation.isPending
              ? <span className="sk-spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: '#fff transparent transparent' }} />
              : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
            }
          </button>
          {/* Cancel edit */}
          <button
            onClick={() => { setEditing(false); setEditPrice(item.sellingPrice); }}
            style={{
              width: 34, height: 34, flexShrink: 0,
              background: 'var(--surface-container)', border: 'none',
              borderRadius: 'var(--radius)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--secondary)',
            }}
            aria-label="Cancel edit"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Price display */}
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', minWidth: 56, textAlign: 'right' }}>
            ₹{item.sellingPrice}
          </span>
          {/* Edit button */}
          <button
            id={`edit-item-${item._id}`}
            onClick={() => { setEditing(true); setEditPrice(item.sellingPrice); }}
            style={{
              width: 34, height: 34, flexShrink: 0,
              background: 'var(--surface-container)', border: 'none',
              borderRadius: 'var(--radius)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--secondary)',
              transition: 'background 0.15s',
            }}
            aria-label={`Edit ${item.name}`}
            onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-high)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--surface-container)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
          </button>
          {/* Delete button */}
          <button
            id={`delete-item-${item._id}`}
            onClick={() => onDeleteRequest(item)}
            style={{
              width: 34, height: 34, flexShrink: 0,
              background: 'var(--error-container)', border: 'none',
              borderRadius: 'var(--radius)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--error)',
              transition: 'background 0.15s',
            }}
            aria-label={`Delete ${item.name}`}
            onMouseOver={e => e.currentTarget.style.background = '#ffc9c6'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--error-container)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Inventory Page
───────────────────────────────────────────────────────── */
export default function Inventory() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // item to confirm-delete

  const [itemsData, setItemsData] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 1. Initial fast local load from IndexedDB cache
  useEffect(() => {
    const renderFromCache = async () => {
      try {
        const cachedItems = await db.inventory.toArray();
        console.log("Local cache contents:", cachedItems);
        if (cachedItems.length > 0) {
          setItemsData(cachedItems); // Map the text fields instantly
          setIsInitialLoading(false); // ⚡ CRITICAL: Kill the loading spinner immediately here!
        }
      } catch (err) {
        console.error("Cache read error:", err);
      }
    };
    renderFromCache();
  }, []);

  // 2. Background sync via react-query
  const { isError } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data } = await apiClient.get('/items');
      
      // Update local db index quietly
      await db.inventory.clear();
      if (data && data.length > 0) {
        await db.inventory.bulkAdd(data);
      }
      
      setItemsData(data);
      setIsInitialLoading(false); // Drop spinner when server responds if cache was empty
      return data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/items/${id}`),

    // ── Optimistic delete: remove item instantly before server confirms ──────
    onMutate: async (id) => {
      // Cancel any in-flight item refetches to avoid overwriting our update
      await queryClient.cancelQueries({ queryKey: ['items'] });
      // Snapshot the current list so we can rollback on error
      const previousItems = queryClient.getQueryData(['items']);
      // Immediately remove the item from the cache
      queryClient.setQueryData(['items'], (old) => old?.filter(i => i._id !== id) ?? []);
      return { previousItems };
    },

    onSuccess: () => {
      showSuccess(`"${deleteTarget?.name}" removed from catalog.`);
      setDeleteTarget(null);
    },

    onError: (err, _id, ctx) => {
      // Rollback cache to snapshot if the API call failed
      if (ctx?.previousItems) {
        queryClient.setQueryData(['items'], ctx.previousItems);
      }
      showError(err.response?.data?.message || 'Failed to delete item.');
      setDeleteTarget(null);
    },

    // Reconcile with server after either success or failure
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  return (
    <>
      {/* ── Header Row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Inventory</h1>
        <button
          id="inv-add-new-btn"
          className="btn btn-primary"
          style={{ height: 40, fontSize: '0.8rem', fontWeight: 600, paddingLeft: 14, paddingRight: 14, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setShowAddForm(v => !v)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {showAddForm ? 'expand_less' : 'add_circle'}
          </span>
          {showAddForm ? 'Collapse' : 'Add New Item'}
        </button>
      </div>

      {/* ── Add Item Form (toggled) ── */}
      {showAddForm && (
        <AddItemForm
          onSuccess={() => setShowAddForm(false)}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* ── Catalog List ── */}
      {isInitialLoading && (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <div className="sk-spinner" />
          <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', marginTop: 12 }}>Loading catalog...</p>
        </div>
      )}

      {isError && (
        <div className="empty-state">
          <span className="material-symbols-outlined empty-state__icon">wifi_off</span>
          <div className="empty-state__title">Connection Error</div>
          <div className="empty-state__sub">Could not reach the server.</div>
        </div>
      )}

      {!isInitialLoading && !isError && itemsData.length === 0 && (
        <div className="empty-state">
          <span className="material-symbols-outlined empty-state__icon">inventory_2</span>
          <div className="empty-state__title">No items yet</div>
          <div className="empty-state__sub">Tap "Add New Item" to build your catalog.</div>
        </div>
      )}

      {!isInitialLoading && !isError && itemsData.length > 0 && (
        <div className="sk-card overflow-hidden mb-3">
          {/* List header */}
          <div style={{
            padding: '10px 14px',
            background: 'var(--surface-bright)',
            borderBottom: '1px solid var(--surface-variant)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Product Catalog
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>
              {itemsData.length} {itemsData.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {itemsData.map((item, idx) => (
            <CatalogRow
              key={item._id}
              item={item}
              onDeleteRequest={(it) => setDeleteTarget(it)}
            />
          ))}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <DeleteModal
          itemName={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </>
  );
}
