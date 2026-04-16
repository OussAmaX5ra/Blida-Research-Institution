export default function AdminConfirmDialog({
  confirmLabel,
  confirmValue,
  description,
  isOpen,
  inputLabel = 'Type the slug to confirm',
  onCancel,
  onChange,
  onConfirm,
  title,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="admin-dialog-backdrop" role="presentation">
      <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
        <p className="admin-section-kicker">Confirmation Required</p>
        <h3 id="admin-dialog-title">{title}</h3>
        <p className="admin-body-copy">{description}</p>

        <label className="admin-dialog-field">
          <span>{inputLabel}</span>
          <input type="text" value={confirmValue} onChange={(event) => onChange(event.target.value)} />
        </label>

        <div className="admin-dialog-actions">
          <button type="button" className="admin-secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="admin-danger-button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
