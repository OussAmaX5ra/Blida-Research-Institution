import { createContext, useContext, useEffect, useEffectEvent, useState, useTransition } from 'react';
import { fetchPublicCollections } from '../lib/public-api';

const PublicDataContext = createContext(null);

const emptyCollections = {
  teams: [],
  members: [],
  projects: [],
  publications: [],
  news: [],
  gallery: [],
};

const emptyMeta = {
  teams: {},
  members: {},
  projects: {},
  publications: {},
  news: {},
  gallery: {},
};

export function PublicDataProvider({ children }) {
  const [state, setState] = useState({
    collections: emptyCollections,
    meta: emptyMeta,
    status: 'idle',
    error: '',
  });
  const [isPending, startTransition] = useTransition();

  const loadPublicData = useEffectEvent(async (signal) => {
    startTransition(() => {
      setState((current) => ({
        ...current,
        status: current.collections.teams.length ? 'refreshing' : 'loading',
        error: '',
      }));
    });

    try {
      const payload = await fetchPublicCollections(signal);
      const collectionEntries = Object.values(payload);
      const collectionErrors = collectionEntries
        .map((collection) => collection.meta?.error)
        .filter(Boolean);
      const hasSuccessfulCollection = collectionEntries.some(
        (collection) => !collection.meta?.error,
      );

      if (signal?.aborted) {
        return;
      }

      startTransition(() => {
        setState({
          collections: {
            teams: payload.teams.data,
            members: payload.members.data,
            projects: payload.projects.data,
            publications: payload.publications.data,
            news: payload.news.data,
            gallery: payload.gallery.data,
          },
          meta: {
            teams: payload.teams.meta,
            members: payload.members.meta,
            projects: payload.projects.meta,
            publications: payload.publications.meta,
            news: payload.news.meta,
            gallery: payload.gallery.meta,
          },
          status: hasSuccessfulCollection ? 'ready' : 'error',
          error: collectionErrors.join(' '),
        });
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      startTransition(() => {
        setState((current) => ({
          ...current,
          status: current.collections.teams.length ? 'ready' : 'error',
          error: error instanceof Error ? error.message : 'Unable to load the public data.',
        }));
      });
    }
  });

  useEffect(() => {
    const abortController = new AbortController();
    loadPublicData(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <PublicDataContext.Provider
      value={{
        ...state,
        isPending,
        isLoading: state.status === 'loading',
        isRefreshing: state.status === 'refreshing',
        hasLoaded: state.status === 'ready' || state.status === 'refreshing',
        retry() {
          const abortController = new AbortController();
          loadPublicData(abortController.signal);
        },
      }}
    >
      {children}
    </PublicDataContext.Provider>
  );
}

export function usePublicData() {
  const context = useContext(PublicDataContext);

  if (!context) {
    throw new Error('usePublicData must be used within a PublicDataProvider.');
  }

  return context;
}
