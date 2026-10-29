export interface TimeDistributionJson {
  activities?: { name: string; minutes: number }[];
}

// The time distribution always covers the full total duration: minutes
// not assigned to an activity end up in this special entry.
export const UNVERTEILTE_ZEIT = 'nicht verteilte Zeit';

// How many months back the distribution screen offers previously used
// activity names for selection. Configurable via localStorage under
// this key (a positive integer number of months).
export const ACTIVITY_HISTORY_MONTHS_KEY = 'activity-history-months';
export const DEFAULT_ACTIVITY_HISTORY_MONTHS = 3;
