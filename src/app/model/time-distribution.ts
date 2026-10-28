export interface TimeDistributionJson {
  activities?: { name: string; minutes: number }[];
}

// Default activities offered for selection in addition to free text.
export const DEFAULT_ACTIVITIES = [
  'Programmierung',
  'Meetings',
  'Dokumentation',
  'Support',
] as const;

// The time distribution always covers the full total duration: minutes
// not assigned to an activity end up in this special entry.
export const UNVERTEILTE_ZEIT = 'nicht verteilte Zeit';
