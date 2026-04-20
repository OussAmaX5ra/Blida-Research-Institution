/**
 * Merge two lists of records keyed by `slug`. Rows from `apiList` replace same-slug rows from `sourceList`.
 */
export function mergeRecordsBySlug(sourceList, apiList) {
  const map = new Map();

  for (const item of sourceList) {
    if (item?.slug) {
      map.set(item.slug, item);
    }
  }

  for (const item of apiList) {
    if (item?.slug) {
      map.set(item.slug, item);
    }
  }

  return Array.from(map.values());
}
