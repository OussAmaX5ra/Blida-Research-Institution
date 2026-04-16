import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Mail,
  KeyRound,
} from 'lucide-react';
import { contactInfo, labInfo } from '../data/mockData';
import { loginAdmin } from '../lib/admin-auth-api.js';
import { useAdminSession } from '../providers/useAdminSession.js';

export default function AdminLoginPage({ onNavigate }) {
  const { completeLogin, isAuthenticated } = useAdminSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const user = await loginAdmin({ email, password });
      completeLogin(user);
      setAuthenticatedUser(user);
      setPassword('');
      onNavigate(event, '/admin');
    } catch (error) {
      setAuthenticatedUser(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'The login service is unavailable right now. Check that the backend is running and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-shell">
        <div className="admin-auth-intro">
          <p className="admin-section-kicker">Administrative Access</p>
          <h1>Enter the protected editorial workspace.</h1>
          <p>
            This side of {labInfo.name} is intentionally separate from the public site. It is built
            for review, approval, curation, and institutional control rather than public browsing.
          </p>
          <div className="admin-auth-note">
            <ShieldCheck size={16} />
            <span>Only authorized administrators with valid sessions can enter this boundary.</span>
          </div>
        </div>

        <section className="admin-auth-card">
          <form onSubmit={handleSubmit} className="admin-auth-form">
            <label className="admin-auth-field">
              <span>Email</span>
              <div className="admin-auth-input">
                <Mail size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@lab.edu"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label className="admin-auth-field">
              <span>Password</span>
              <div className="admin-auth-input">
                <KeyRound size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  minLength={8}
                  required
                />
              </div>
            </label>

            {errorMessage ? (
              <div className="admin-auth-alert" role="alert">
                <AlertTriangle size={16} />
                <p>{errorMessage}</p>
              </div>
            ) : null}

            {authenticatedUser ? (
              <div className="admin-auth-success">
                <div className="admin-auth-success-row">
                  <CheckCircle2 size={18} />
                  <p>Signed in</p>
                </div>
                <strong>{authenticatedUser.fullName}</strong>
                <span>
                  {authenticatedUser.email} · {authenticatedUser.role.replaceAll('_', ' ')}
                </span>
              </div>
            ) : null}

            <button type="submit" disabled={isSubmitting} className="admin-auth-submit">
              {isSubmitting ? 'Signing in...' : isAuthenticated ? 'Continue to admin' : 'Sign in to admin'}
              <ChevronRight size={15} />
            </button>
          </form>

          <div className="admin-auth-links">
            <a href="/" onClick={(event) => onNavigate(event, '/')}>
              Return to public site
              <ArrowRight size={14} />
            </a>
            <a href={`mailto:${contactInfo.email}`}>Need access help? {contactInfo.email}</a>
          </div>
        </section>
      </section>
    </main>
  );
}

