import { useContext } from 'react';
import { AdminSessionContext } from './AdminSessionContext.js';

export function useAdminSession() {
  const context = useContext(AdminSessionContext);

  if (!context) {
    throw new Error('useAdminSession must be used within an AdminSessionProvider.');
  }

  return context;
}
