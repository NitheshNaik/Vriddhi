import { useEffect, useRef, useState } from 'react';

let toastId = 0;

// Global toast state (simple pub-sub without extra libraries)
const listeners = new Set();
const toasts = [];

function notify(message, type = 'default') {
  const id = ++toastId;
  toasts.push({ id, message, type });
  listeners.forEach(fn => fn([...toasts]));
  setTimeout(() => {
    const idx = toasts.findIndex(t => t.id === id);
    if (idx > -1) toasts.splice(idx, 1);
    listeners.forEach(fn => fn([...toasts]));
  }, 2800);
}

export function showToast(message, type = 'default') { notify(message, type); }
export function showSuccess(message) { notify(message, 'success'); }
export function showError(message) { notify(message, 'error'); }

export default function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);

  return (
    <div className="toast-container" aria-live="polite">
      {items.map(t => (
        <div key={t.id} className={`toast-pill ${t.type}`}>
          {t.type === 'success' && <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: 'middle' }}>check_circle</span>}
          {t.type === 'error' && <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: 'middle' }}>error</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}
