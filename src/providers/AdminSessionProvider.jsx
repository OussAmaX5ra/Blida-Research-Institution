import { useEffect, useEffectEvent, useRef, useState, useTransition } from 'react';

import { loadCurrentAdmin, logoutAdmin } from '../lib/admin-auth-api.js';
import {
  clearCurrentAdminActivityActor,
  recordAdminActivity,
  setCurrentAdminActivityActor,
} from '../lib/admin-activity-log.js';
import { AdminSessionContext } from './AdminSessionContext.js';

function isAdminPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function AdminSessionProvider({ children }) {
  const [pathname, setPathname] = useState(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname,
  );
  const [state, setState] = useState({
    status: 'loading',
    user: null,
    error: '',
  });
  const [isPending, startTransition] = useTransition();
  const hasFailedSessionProbeRef = useRef(false);
  const shouldResolveSession = isAdminPath(pathname);

  const refreshSession = useEffectEvent(async (signal) => {
    try {
      const user = await loadCurrentAdmin(signal, { attemptRefresh: shouldResolveSession });

      if (signal?.aborted) {
        return;
      }

      setCurrentAdminActivityActor(user);
      hasFailedSessionProbeRef.current = false;

      startTransition(() => {
        setState({
          status: user ? 'authenticated' : 'unauthenticated',
          user: user ?? null,
          error: '',
        });
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      const isUnauthenticatedError = error?.status === 401;
      const isRateLimitedError = error?.status === 429;
      if (isUnauthenticatedError) {
        hasFailedSessionProbeRef.current = true;
      }

      if (!isRateLimitedError) {
        clearCurrentAdminActivityActor();
      }

      startTransition(() => {
        setState((current) => {
          if (isRateLimitedError && current.user) {
            return {
              ...current,
              status: 'authenticated',
              error: '',
            };
          }

          return {
            status: 'unauthenticated',
            user: null,
            error:
              isUnauthenticatedError
                ? ''
                : error instanceof Error
                  ? error.message
                  : 'Unable to load the admin session.',
          };
        });
      });
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const hasInitialSessionChecked = useRef(false);

  useEffect(() => {
    if (!shouldResolveSession) {
      clearCurrentAdminActivityActor();
      startTransition(() => {
        setState((current) => ({
          ...current,
          status: 'unauthenticated',
          user: null,
          error: '',
        }));
      });
      return undefined;
    }

    if (hasFailedSessionProbeRef.current && !state.user) {
      return undefined;
    }

    if (hasInitialSessionChecked.current && state.user) {
      return undefined;
    }

    hasInitialSessionChecked.current = true;

    const abortController = new AbortController();
    refreshSession(abortController.signal);

    return () => {
      abortController.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, shouldResolveSession]);

  return (
    <AdminSessionContext.Provider
      value={{
        ...state,
        isPending,
        isAuthenticated: state.status === 'authenticated',
        isLoading: state.status === 'loading',
        completeLogin(user) {
          hasFailedSessionProbeRef.current = false;
          setCurrentAdminActivityActor(user);
          recordAdminActivity({
            action: 'auth.login',
            actor: user,
            entityType: 'system',
            summary: `${user.fullName} signed in to the protected workspace.`,
          });

          startTransition(() => {
            setState({
              status: 'authenticated',
              user,
              error: '',
            });
          });
        },
        async logout() {
          const currentUser = state.user;

          try {
            await logoutAdmin();
          } finally {
            hasFailedSessionProbeRef.current = false;
            if (currentUser) {
              recordAdminActivity({
                action: 'auth.logout',
                actor: currentUser,
                entityType: 'system',
                summary: `${currentUser.fullName} signed out of the protected workspace.`,
              });
            }

            clearCurrentAdminActivityActor();

            startTransition(() => {
              setState({
                status: 'unauthenticated',
                user: null,
                error: '',
              });
            });
          }
        },
        async retry() {
          hasFailedSessionProbeRef.current = false;
          hasInitialSessionChecked.current = true;
          const abortController = new AbortController();
          try {
            const user = await loadCurrentAdmin(abortController.signal, { attemptRefresh: shouldResolveSession });

            if (abortController.signal.aborted) {
              return;
            }

            setCurrentAdminActivityActor(user);

            startTransition(() => {
              setState({
                status: user ? 'authenticated' : 'unauthenticated',
                user: user ?? null,
                error: '',
              });
            });
          } catch (error) {
            if (abortController.signal.aborted) {
              return;
            }

            const isUnauthenticatedError = error?.status === 401;
            const isRateLimitedError = error?.status === 429;

            if (!isRateLimitedError) {
              clearCurrentAdminActivityActor();
            }

            startTransition(() => {
              setState((current) => {
                if (isRateLimitedError && current.user) {
                  return {
                    ...current,
                    status: 'authenticated',
                    error: '',
                  };
                }

                return {
                  status: 'unauthenticated',
                  user: null,
                  error:
                    isUnauthenticatedError
                      ? ''
                      : error instanceof Error
                        ? error.message
                        : 'Unable to load the admin session.',
                };
              });
            });
          }
        },
      }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
}

export default AdminSessionProvider;
