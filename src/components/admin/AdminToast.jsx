import { CheckCircle2, ShieldAlert, X } from 'lucide-react';

const toneMeta = {
  error: {
    icon: ShieldAlert,
    title: 'Action blocked',
  },
  success: {
    icon: CheckCircle2,
    title: 'Success',
  },
};

export default function AdminToast({ toast, onClose }) {
  if (!toast) {
    return null;
  }

  const meta = toneMeta[toast.type] ?? toneMeta.success;
  const Icon = meta.icon;

  return (
    <div className={`admin-toast admin-toast-${toast.type}`} role="status" aria-live="polite">
      <div className="admin-toast-icon">
        <Icon size={18} />
      </div>
      <div className="admin-toast-copy">
        <strong>{toast.title ?? meta.title}</strong>
        <span>{toast.message}</span>
      </div>
      <button type="button" className="admin-toast-close" onClick={onClose} aria-label="Dismiss notification">
        <X size={15} />
      </button>
    </div>
  );
}
