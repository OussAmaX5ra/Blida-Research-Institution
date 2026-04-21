import { useState } from 'react';
import { KeyRound, Plus, UserPlus } from 'lucide-react';

import { queueAdminToast } from '../../lib/admin-toast.js';

const roleOptions = [
  { value: 'content_admin', label: 'Content admin' },
  { value: 'editor', label: 'Editor' },
];

const roleMeta = {
  content_admin: {
    label: 'Content admin',
    description: 'Coordinates the publishing desks and keeps institutional content quality aligned.',
  },
  editor: {
    label: 'Editor',
    description: 'Handles day-to-day operational edits inside the publication, news, and gallery surfaces.',
  },
};

export function UserCreateDialog({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'content_admin',
  });
  const [createdUser, setCreatedUser] = useState(null);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      queueAdminToast({
        type: 'error',
        title: 'Validation error',
        message: 'Full name and email are required.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/content/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.details?.[0]?.message ?? result.message ?? 'Failed to create user.';
        queueAdminToast({
          type: 'error',
          title: 'Creation blocked',
          message: errorMessage,
        });
        return;
      }

      setCreatedUser({
        ...result.data,
        temporaryPassword: result.temporaryPassword,
      });

      queueAdminToast({
        type: 'success',
        title: 'User created',
        message: `${result.data.fullName} has been added with ${result.data.role} role.`,
      });

      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch {
      queueAdminToast({
        type: 'error',
        title: 'Network error',
        message: 'Unable to communicate with the server.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setFormData({ fullName: '', email: '', role: 'content_admin' });
    setCreatedUser(null);
    onClose();
  }

  return (
    <div className="admin-dialog-backdrop" role="presentation">
      <div
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-create-title"
      >
        {createdUser ? (
          <>
            <p className="admin-section-kicker">Account Created</p>
            <h3 id="admin-user-create-title">{createdUser.fullName} has been added.</h3>
            <p className="admin-body-copy">
              This account can now sign in using the temporary password shown below. The user will be
              prompted to create a new password on first sign-in.
            </p>

            <div className="admin-inline-banner">
              <KeyRound size={16} />
              <span>
                Share this temporary password once; the user must rotate credentials on first sign-in.
              </span>
            </div>

            <label className="admin-form-field">
              <span>Temporary password</span>
              <input readOnly value={createdUser.temporaryPassword} />
              <em>This value is only shown once. Save it securely before closing.</em>
            </label>

            <div className="admin-form-preview-grid">
              <div>
                <span>Account email</span>
                <strong>{createdUser.email}</strong>
              </div>
              <div>
                <span>Assigned role</span>
                <strong>{roleMeta[createdUser.role]?.label ?? createdUser.role}</strong>
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="button" className="admin-secondary-button" onClick={handleClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="admin-section-kicker">Access Workflow</p>
            <h3 id="admin-user-create-title">Add a new admin account.</h3>
            <p className="admin-body-copy">
              Create a new administrator account with content admin or editor role. A temporary
              password will be generated for first-time sign-in.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <label className="admin-form-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                    placeholder="Enter the administrator's full name"
                    required
                  />
                </label>

                <label className="admin-form-field">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    placeholder="Enter a valid email address"
                    required
                  />
                </label>

                <label className="admin-form-field">
                  <span>Assigned role</span>
                  <select
                    value={formData.role}
                    onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <em>{roleMeta[formData.role]?.description}</em>
                </label>
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-secondary-button" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="admin-primary-button" disabled={isSubmitting}>
                  <UserPlus size={15} />
                  {isSubmitting ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function AddUserButton({ onClick }) {
  return (
    <button type="button" className="admin-secondary-button" onClick={onClick}>
      <Plus size={15} />
      Add user
    </button>
  );
}