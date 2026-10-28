export type AppView = 'day-plan' | 'zeit-verteilung';

export function getViewFromURL(): AppView {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'zeit-verteilung'
    ? 'zeit-verteilung'
    : 'day-plan';
}

export function viewUrl(day: string, view: AppView): string {
  if (view === 'zeit-verteilung') {
    return `/?day=${day}&view=zeit-verteilung`;
  }
  return `/?day=${day}`;
}
