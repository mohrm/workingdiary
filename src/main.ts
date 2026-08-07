import { createApp } from './app/app';

const rootElement = document.querySelector('app-root');
if (!rootElement) {
  throw new Error('Root element <app-root> not found');
}

const app = createApp();
rootElement.appendChild(app.element);

window.addEventListener('popstate', () => app.update());
