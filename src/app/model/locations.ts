// Single source of truth for the "Arbeitsort" values used across Section,
// the section edit form and the duration summary — keeps them from
// drifting out of sync when a value is renamed or a new one is added.
export const LOCATIONS = {
  UNASSIGNED: 'nicht zugeordnet',
  OFFICE: 'Büro',
  MOBILE: 'mobil',
} as const;

export type Location = (typeof LOCATIONS)[keyof typeof LOCATIONS];

// Locations that represent an actual place of work, i.e. every LOCATIONS
// value except the UNASSIGNED default. The duration summary breaks totals
// down per entry here, so a new work location only needs to be added to
// LOCATIONS to show up there too.
export const WORK_LOCATIONS: Location[] = Object.values(LOCATIONS).filter(
  (location) => location !== LOCATIONS.UNASSIGNED,
);

// Short display labels for the Abschnitteditor's view/edit location cell —
// kept separate from the LOCATIONS values themselves so persisted data and
// equality checks are unaffected by display-only abbreviations.
export const LOCATION_LABELS: Record<Location, string> = {
  [LOCATIONS.UNASSIGNED]: 'kein',
  [LOCATIONS.OFFICE]: LOCATIONS.OFFICE,
  [LOCATIONS.MOBILE]: LOCATIONS.MOBILE,
};
