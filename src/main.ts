import './styles.scss';
import './app/app.scss';
import './app/feature/day-plan/day-plan.scss';
import './app/feature/day-plan/abschnitt/abschnitt.scss';
import './app/feature/day-plan/abschnitt-liste/abschnitt-liste.scss';
import './app/feature/day-plan/abschnitt-summe/abschnitt-summe.scss';
import './app/feature/day-plan/stempeluhr/stempeluhr.scss';
import './app/feature/download-plans/download-plans.scss';
import { createApp } from './app/app.js';

const rootElement = document.querySelector('app-root');
if (!rootElement) {
  throw new Error('Root element <app-root> not found');
}

const app = createApp();
rootElement.appendChild(app.element);

window.addEventListener('popstate', () => app.update());
