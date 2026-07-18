import { persistence } from '../../services/persistence.js';

export function createDownloadPlans() {
  const el = document.createElement('div');
  el.className = 'download-plans';

  function render() {
    const plans = persistence.loadPlans();
    const stringifiedPlans = JSON.stringify(plans);
    const blob = new Blob([stringifiedPlans], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);

    const now = new Date();
    const pad = (num) => num.toString().padStart(2, '0');
    const timestamp =
      now.getFullYear() + '-' +
      pad(now.getMonth() + 1) + '-' +
      pad(now.getDate()) + '_' +
      pad(now.getHours()) + '-' +
      pad(now.getMinutes()) + '-' +
      pad(now.getSeconds());
    const filename = `dayplans_${timestamp}.json`;

    el.innerHTML = `<a href="${blobUrl}" download="${filename}">Daten exportieren</a>`;
  }

  render();
  return { element: el };
}
