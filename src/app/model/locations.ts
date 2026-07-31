// Single source of truth for the "Arbeitsort" values used across Section,
// the section edit form and the duration summary — keeps them from
// drifting out of sync when a value is renamed or a new one is added.
export const LOCATIONS = {
  UNASSIGNED: 'nicht zugeordnet',
  OFFICE: 'Büro',
  MOBILE: 'mobil',
} as const;
