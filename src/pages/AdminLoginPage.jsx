import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Mail,
} from 'lucide-react';
import { contactInfo, labInfo } from '../data/mockData';

export default function AdminLoginPage({ onNavigate }) {
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
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setAuthenticatedUser(null);
        setErrorMessage(payload?.error?.message ?? 'Invalid email or password.');
        return;
      }

      setAuthenticatedUser(payload?.user ?? null);
      setPassword('');
    } catch {
      setAuthenticatedUser(null);
      setErrorMessage(
        'The login service is unavailable right now. Check that the backend is running and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <section className="rounded-[2rem] border px-6 py-8 md:px-8 md:py-10" style={{ borderColor: 'rgba(13,17,23,0.08)', background: 'rgba(255,255,255,0.68)' }}>
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.34em] text-[var(--color-teal)]">
          Admin Login
        </p>
        <h1
          className="page-section-title max-w-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Sign in to the admin workspace.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-black/64">
          This page is only for authorized administrators of {labInfo.name}. Public visitors should continue browsing the main site.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-[1.8rem] border p-6 md:p-7" style={{ borderColor: 'rgba(201,168,76,0.18)', background: 'linear-gradient(155deg, #11161d, #15202d 60%, #1e454d)' }}>
          <label
            className="block rounded-[1.25rem] border px-4 py-4"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
          >
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/42">Email</span>
            <div className="mt-3 flex items-center gap-3">
              <Mail size={16} className="text-[var(--color-gold)]" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@lab.edu"
                autoComplete="username"
                required
                className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/34"
              />
            </div>
          </label>

          <label
            className="block rounded-[1.25rem] border px-4 py-4"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
          >
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/42">Password</span>
            <div className="mt-3 flex items-center gap-3">
              <KeyRound size={16} className="text-[var(--color-gold)]" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                minLength={8}
                required
                className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/34"
              />
            </div>
          </label>

          {errorMessage ? (
            <div
              className="flex items-start gap-3 rounded-[1.25rem] border px-4 py-4"
              style={{ borderColor: 'rgba(255,206,137,0.24)', background: 'rgba(164,84,42,0.16)' }}
            >
              <AlertTriangle size={16} className="mt-1 text-[var(--color-gold)]" />
              <p className="text-sm leading-7 text-white/78">{errorMessage}</p>
            </div>
          ) : null}

          {authenticatedUser ? (
            <div
              className="rounded-[1.25rem] border px-4 py-4"
              style={{ borderColor: 'rgba(201,168,76,0.24)', background: 'rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[var(--color-gold)]" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/84">
                  Signed in
                </p>
              </div>
              <p
                className="mt-4 text-2xl font-semibold leading-tight text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {authenticatedUser.fullName}
              </p>
              <p className="mt-2 text-sm text-white/68">
                {authenticatedUser.email} - {authenticatedUser.role.replaceAll('_', ' ')}
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: '#f7f5f0', color: '#0d1117' }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
            <LockKeyhole size={15} />
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-black/58">
          <a
            href="/"
            onClick={(event) => onNavigate(event, '/')}
            className="inline-flex items-center gap-2 font-semibold text-[var(--color-teal)]"
          >
            Return to public site
            <ArrowRight size={14} />
          </a>
          <a href={`mailto:${contactInfo.email}`} className="font-medium text-black/62">
            Need access help? {contactInfo.email}
          </a>
        </div>
      </section>
    </div>
  );
}

