import { Time } from '../../../model/Time.js';
import {
  persistence,
  SECTIONS_CHANGED,
} from '../../../services/persistence.js';

export function createAbschnittSumme(day) {
  const el = document.createElement('div');
  el.className = 'abschnitt-summe-host';

  let abschnitte = persistence.loadSections(day) ?? [];

  function sumMinutes(location) {
    return abschnitte
      .filter((section) => !location || section.location === location)
      .map((section) => section.durationInMinutes())
      .reduce((prev, cur) => prev + cur, 0);
  }

  function toTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes - 60 * hours;
    return new Time(hours, remainingMinutes);
  }

  function computeDurations() {
    return {
      gesamtdauer: toTime(sumMinutes()),
      bueroDauer: toTime(sumMinutes('Büro')),
      mobilDauer: toTime(sumMinutes('mobil')),
    };
  }

  function render() {
    const { gesamtdauer, bueroDauer, mobilDauer } = computeDurations();

    function formatIndustrial(time) {
      const value = typeof time === 'number' ? time : time.industrial();
      return value.toFixed(2);
    }

    el.innerHTML = `
      <table class="abschnitt-summe">
        <thead align="center">
          <tr>
            <th>Arbeitsort</th>
            <th>Gesamtdauer</th>
            <th class="abschnitt-summe__nowrap">Industriezeit (exakt/gerundet)</th>
          </tr>
        </thead>
        <tbody align="center">
          <tr>
            <td>Büro</td>
            <td>${bueroDauer.formattedString()}</td>
            <td>${formatIndustrial(bueroDauer)} / ${formatIndustrial(bueroDauer.industrialQuarterPrecision())}</td>
          </tr>
          <tr>
            <td>mobil</td>
            <td>${mobilDauer.formattedString()}</td>
            <td>${formatIndustrial(mobilDauer)} / ${formatIndustrial(mobilDauer.industrialQuarterPrecision())}</td>
          </tr>
          <tr>
            <td>Gesamt</td>
            <td data-testid="fullduration">${gesamtdauer.formattedString()}</td>
            <td data-testid="fullduration-industry-combined">${formatIndustrial(gesamtdauer)} / ${formatIndustrial(gesamtdauer.industrialQuarterPrecision())}</td>
          </tr>
        </tbody>
      </table>`;
  }

  function handleSectionsChanged(e) {
    const { day: changedDay, sections } = e.detail;
    if (changedDay === day) {
      abschnitte = sections ?? [];
      render();
    }
  }

  function update(newDay) {
    day = newDay;
    abschnitte = persistence.loadSections(day) ?? [];
    render();
  }

  window.addEventListener(SECTIONS_CHANGED, handleSectionsChanged);

  render();
  return {
    element: el,
    update,
    destroy: () => {
      window.removeEventListener(SECTIONS_CHANGED, handleSectionsChanged);
    },
  };
}
