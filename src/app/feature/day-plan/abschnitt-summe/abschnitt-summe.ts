import type { Component } from '../../../component';
import { LOCATIONS, type Location } from '../../../model/locations';
import { Time } from '../../../model/Time';
import { persistence } from '../../../services/persistence';

interface AbschnittDurations {
  gesamtdauer: Time;
  bueroDauer: Time;
  mobilDauer: Time;
}

export interface AbschnittSummeComponent extends Component {
  update: (day: string) => void;
}

export function createAbschnittSumme(day: string): AbschnittSummeComponent {
  const el = document.createElement('div');
  el.className = 'abschnitt-summe-host';

  let abschnitte = persistence.loadSections(day) ?? [];

  function sumMinutes(location?: Location): number {
    return abschnitte
      .filter((section) => !location || section.location === location)
      .map((section) => section.durationInMinutes())
      .reduce((prev, cur) => prev + cur, 0);
  }

  function toTime(minutes: number): Time {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes - 60 * hours;
    return new Time(hours, remainingMinutes);
  }

  function computeDurations(): AbschnittDurations {
    return {
      gesamtdauer: toTime(sumMinutes()),
      bueroDauer: toTime(sumMinutes(LOCATIONS.OFFICE)),
      mobilDauer: toTime(sumMinutes(LOCATIONS.MOBILE)),
    };
  }

  function render() {
    const { gesamtdauer, bueroDauer, mobilDauer } = computeDurations();

    function formatIndustrial(time: Time | number): string {
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

  function update(newDay: string): void {
    day = newDay;
    abschnitte = persistence.loadSections(day) ?? [];
    render();
  }

  render();
  return { element: el, update };
}
