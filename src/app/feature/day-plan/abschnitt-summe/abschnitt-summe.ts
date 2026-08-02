import type { Component } from '../../../component';
import { type Location, WORK_LOCATIONS } from '../../../model/locations';
import { Time } from '../../../model/Time';
import { persistence } from '../../../services/persistence';

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

  function formatIndustrial(time: Time | number): string {
    const value = typeof time === 'number' ? time : time.industrial();
    return value.toFixed(2);
  }

  function durationRow(label: string, dauer: Time, testId?: string): string {
    const durationAttr = testId ? ` data-testid="${testId}"` : '';
    const industryTestId = testId ? `${testId}-industry-combined` : undefined;
    const industryAttr = industryTestId
      ? ` data-testid="${industryTestId}"`
      : '';
    return `
          <tr>
            <td>${label}</td>
            <td${durationAttr}>${dauer.formattedString()}</td>
            <td${industryAttr}>${formatIndustrial(dauer)} / ${formatIndustrial(dauer.industrialQuarterPrecision())}</td>
          </tr>`;
  }

  function render() {
    const gesamtdauer = toTime(sumMinutes());
    const locationRows = WORK_LOCATIONS.map((location) =>
      durationRow(location, toTime(sumMinutes(location))),
    ).join('');

    el.innerHTML = `
      <table class="abschnitt-summe">
        <thead align="center">
          <tr>
            <th>Arbeitsort</th>
            <th>Gesamtdauer</th>
            <th class="abschnitt-summe__nowrap">Industriezeit (exakt/gerundet)</th>
          </tr>
        </thead>
        <tbody align="center">${locationRows}${durationRow('Gesamt', gesamtdauer, 'fullduration')}
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
