export type AppView = 'day-plan' | 'zeit-verteilung';

export function getViewFromURL(): AppView {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'zeit-verteilung'
    ? 'zeit-verteilung'
    : 'day-plan';
}

// Query-relative URLs (no leading slash): the app also runs under a
// non-root base path (branch previews on GitHub Pages), where a
// root-relative "/?day=…" would navigate off the preview entirely.
// "index.html?day=…" keeps the current path under both / and /sub/.
export function viewUrl(day: string, view: AppView): string {
  const query =
    view === 'zeit-verteilung'
      ? `?day=${day}&view=zeit-verteilung`
      : `?day=${day}`;
  return `index.html${query}`;
}

export function dayUrl(day: string): string {
  return `index.html?day=${day}`;
}
