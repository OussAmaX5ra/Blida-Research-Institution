import { AdminAbilitiesContext } from './AdminAbilitiesContext.js';
import { useBuildAdminAbilities } from './useAdminAbilities.js';

export default function AdminAbilitiesProvider({ user, children }) {
  const value = useBuildAdminAbilities(user);

  return <AdminAbilitiesContext.Provider value={value}>{children}</AdminAbilitiesContext.Provider>;
}
