import { useContext } from 'react';
import { PublicDataContext } from './PublicDataContext.js';

export function usePublicData() {
  const context = useContext(PublicDataContext);

  if (!context) {
    throw new Error('usePublicData must be used within a PublicDataProvider.');
  }

  return context;
}
