import { useEffect, useEffectEvent, useState, useTransition } from 'react';

import { loadCurrentAdmin, logoutAdmin } from '../lib/admin-auth-api.js';
import { AdminSessionContext } from './AdminSessionContext.js';

function AdminSessionProvider({ children }) {
  const [state, setState] = useState({
    status: 'loading',
    user: null,
    error: '',
  });
  const [isPending, startTransition] = useTransition();

  const refreshSession = useEffectEvent(async (signal) => {
    try {
      const user = await loadCurrentAdmin(signal);

      if (signal?.aborted) {
        return;
      }

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

      startTransition(() => {
        setState({
          status: 'unauthenticated',
          user: null,
          error: error instanceof Error ? error.message : 'Unable to load the admin session.',
        });
      });
    }
  });

  useEffect(() => {
    const abortController = new AbortController();
    refreshSession(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <AdminSessionContext.Provider
      value={{
        ...state,
        isPending,
        isAuthenticated: state.status === 'authenticated',
        isLoading: state.status === 'loading',
        completeLogin(user) {
          startTransition(() => {
            setState({
              status: 'authenticated',
              user,
              error: '',
            });
          });
        },
        async logout() {
          try {
            await logoutAdmin();
          } finally {
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
          const abortController = new AbortController();
          try {
            const user = await loadCurrentAdmin(abortController.signal);

            if (abortController.signal.aborted) {
              return;
            }

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

            startTransition(() => {
              setState({
                status: 'unauthenticated',
                user: null,
                error: error instanceof Error ? error.message : 'Unable to load the admin session.',
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
