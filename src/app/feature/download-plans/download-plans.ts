import type { Component } from '../../component';
import { type DayPlan, persistence } from '../../services/persistence';

export function createDownloadPlans(): Component {
  const el = document.createElement('div');
  el.className = 'download-plans';

  function render() {
    const plans: Record<string, DayPlan> = persistence.loadPlans();
    const stringifiedPlans = JSON.stringify(plans);
    const blob = new Blob([stringifiedPlans], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);

    const now = new Date();
    const pad = (num: number): string => num.toString().padStart(2, '0');
    const timestamp =
      now.getFullYear() +
      '-' +
      pad(now.getMonth() + 1) +
      '-' +
      pad(now.getDate()) +
      '_' +
      pad(now.getHours()) +
      '-' +
      pad(now.getMinutes()) +
      '-' +
      pad(now.getSeconds());
    const filename = `dayplans_${timestamp}.json`;

    el.innerHTML = `<a href="${blobUrl}" download="${filename}">Daten exportieren</a>`;
  }

  render();
  return { element: el };
}
