import { useEffect, useEffectEvent, useState, useTransition } from 'react';
import {
  fetchPublicCollections,
  PUBLIC_DATA_INVALIDATED_EVENT,
} from '../lib/public-api';
import { PublicDataContext } from './PublicDataContext.js';

const emptyCollections = {
  teams: [],
  members: [],
  projects: [],
  publications: [],
  news: [],
  gallery: [],
  phdProgress: [],
};

const emptySiteContext = {
  contactInfo: null,
  labInfo: null,
  researchAxes: [],
};

const emptyMeta = {
  siteContext: {},
  teams: {},
  members: {},
  projects: {},
  publications: {},
  news: {},
  gallery: {},
  phdProgress: {},
};

function PublicDataProvider({ children }) {
  const [state, setState] = useState({
    collections: emptyCollections,
    meta: emptyMeta,
    siteContext: emptySiteContext,
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
            phdProgress: payload.phdProgress.data,
          },
          meta: {
            siteContext: payload.siteContext.meta,
            teams: payload.teams.meta,
            members: payload.members.meta,
            projects: payload.projects.meta,
            publications: payload.publications.meta,
            news: payload.news.meta,
            gallery: payload.gallery.meta,
            phdProgress: payload.phdProgress.meta,
          },
          siteContext: payload.siteContext.data ?? emptySiteContext,
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleRefreshRequest = () => {
      const abortController = new AbortController();
      loadPublicData(abortController.signal);
    };

    window.addEventListener(PUBLIC_DATA_INVALIDATED_EVENT, handleRefreshRequest);

    return () => {
      window.removeEventListener(PUBLIC_DATA_INVALIDATED_EVENT, handleRefreshRequest);
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
          // eslint-disable-next-line react-hooks/rules-of-hooks
          loadPublicData(abortController.signal);
        },
      }}
    >
      {children}
    </PublicDataContext.Provider>
  );
}

export default PublicDataProvider;
