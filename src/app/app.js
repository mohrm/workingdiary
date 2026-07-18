import { persistence } from './services/persistence.js';
import { getCommitTimestamp, getCommitHash, getUrlOfLastCommit } from './services/version.js';
import { createDayPlan } from './feature/day-plan/day-plan.js';
import { createAbschnittSumme } from './feature/day-plan/abschnitt-summe/abschnitt-summe.js';
import { createDownloadPlans } from './feature/download-plans/download-plans.js';

function today() {
  return new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getDayFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('day') ?? today();
}

function navigate(day) {
  history.pushState({ day }, '', `/?day=${day}`);
}

export function createApp() {
  const el = document.createElement('div');
  el.className = 'app-shell';

  let day = getDayFromURL();
  let dayPlan;
  let abschnittSumme;
  let downloadPlans;

  function render() {
    el.innerHTML = `
      <main class="app-main" data-dayplan></main>
      <div class="app-bottom">
        <div class="app-summary" data-abschnitt-summe></div>
        <section class="app-navigation">
          <div class="app-navigation__row">
            <a class="app-navigation__link" data-prev-link href="#">Zurück</a>
            <div class="app-navigation__spacer"></div>
            <a class="app-navigation__link" data-next-link href="#">Vor</a>
          </div>
        </section>
        <footer class="app-footer">
          <div class="app-footer__row">
            <div class="app-footer__spacer"></div>
            <div class="app-footer__title">Versionsinformation</div>
            <div class="app-footer__meta">
              <div>${getCommitTimestamp()}</div>
              <div><a href="${getUrlOfLastCommit()}">${getCommitHash()}</a></div>
            </div>
            <div class="app-footer__spacer"></div>
            <div class="app-footer__actions" data-download-plans></div>
          </div>
        </footer>
      </div>`;

    dayPlan = createDayPlan(day);
    abschnittSumme = createAbschnittSumme(day);
    downloadPlans = createDownloadPlans();

    el.querySelector('[data-dayplan]').appendChild(dayPlan.element);
    el.querySelector('[data-abschnitt-summe]').appendChild(abschnittSumme.element);
    el.querySelector('[data-download-plans]').appendChild(downloadPlans.element);

    bindNavigation();
  }

  function bindNavigation() {
    const prevLink = el.querySelector('[data-prev-link]');
    const nextLink = el.querySelector('[data-next-link]');

    prevLink?.addEventListener('click', (e) => {
      e.preventDefault();
      day = persistence.previousDay(day);
      navigate(day);
      updateView();
    });

    nextLink?.addEventListener('click', (e) => {
      e.preventDefault();
      day = persistence.nextDay(day);
      navigate(day);
      updateView();
    });
  }

  function updateView() {
    dayPlan?.update(day);
    abschnittSumme?.update(day);
    updateNavigationLinks();
  }

  function updateNavigationLinks() {
    const prevLink = el.querySelector('[data-prev-link]');
    const nextLink = el.querySelector('[data-next-link]');
    if (prevLink) prevLink.href = `/?day=${persistence.previousDay(day)}`;
    if (nextLink) nextLink.href = `/?day=${persistence.nextDay(day)}`;
  }

  render();

  return {
    element: el,
    update() {
      day = getDayFromURL();
      updateView();
    },
  };
}
