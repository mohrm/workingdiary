import type { Component } from '../../component';
import {
  Activity,
  calendarMinutesToIndustrial,
  hoursToIndustrialMinutes,
} from '../../model/activities';
import {
  DEFAULT_ACTIVITIES,
  UNVERTEILTE_ZEIT,
} from '../../model/time-distribution';
import { persistence } from '../../services/persistence';
import { bindActions } from '../../util/bind-actions';
import { icon } from '../icons';

export interface ZeitVerteilungComponent extends Component {
  update: (day: string) => void;
}

function totalIndustrialMinutes(day: string): number {
  const sections = persistence.loadSections(day) ?? [];
  const calendarMinutes = sections
    .map((section) => section.durationInMinutes())
    .reduce((prev, cur) => prev + cur, 0);
  return calendarMinutesToIndustrial(calendarMinutes);
}

export function createZeitVerteilung(
  day: string,
  onBack?: () => void,
): ZeitVerteilungComponent {
  const el = document.createElement('section');
  el.className = 'zeit-verteilung';

  let neueTaetigkeit = '';
  let fehlermeldung: string | undefined;

  function verteilteMinuten(aktivitaeten: Activity[]): number {
    return aktivitaeten
      .map((activity) => activity.minutes)
      .reduce((prev, cur) => prev + cur, 0);
  }

  function persist(aktivitaeten: Activity[]): void {
    persistence.saveTimeDistribution(day, aktivitaeten);
  }

  function addTaetigkeit(name: string, minutes: number): boolean {
    const aktivitaeten = persistence.loadTimeDistribution(day) ?? [];
    const trimmed = name.trim();
    if (!trimmed) {
      fehlermeldung = 'Bitte eine Tätigkeit angeben.';
      render();
      return false;
    }
    if (trimmed === UNVERTEILTE_ZEIT) {
      fehlermeldung = 'Diese Tätigkeit ist reserviert.';
      render();
      return false;
    }
    if (aktivitaeten.some((activity) => activity.name === trimmed)) {
      fehlermeldung = 'Diese Tätigkeit gibt es schon.';
      render();
      return false;
    }
    const gesamt = totalIndustrialMinutes(day);
    const frei = gesamt - verteilteMinuten(aktivitaeten);
    if (minutes > frei) {
      fehlermeldung = 'So viel Zeit ist nicht mehr frei.';
      render();
      return false;
    }
    fehlermeldung = undefined;
    persist([...aktivitaeten, new Activity(trimmed, minutes)]);
    render();
    return true;
  }

  function addFreitextTaetigkeit(): void {
    const input = el.querySelector<HTMLInputElement>(
      '[data-testid="neue-taetigkeit"]',
    );
    const hoursInput = el.querySelector<HTMLInputElement>(
      '[data-testid="neue-taetigkeit-industriezeit"]',
    );
    const percentInput = el.querySelector<HTMLInputElement>(
      '[data-testid="neue-taetigkeit-prozent"]',
    );
    const name = input?.value ?? neueTaetigkeit;
    const gesamt = totalIndustrialMinutes(day);
    let minutes: number;
    if ((percentInput?.value ?? '') !== '') {
      const percent = parseDecimal(percentInput?.value ?? '');
      minutes = Math.round((gesamt * percent) / 100);
    } else {
      minutes = hoursToIndustrialMinutes(parseDecimal(hoursInput?.value ?? ''));
    }
    neueTaetigkeit = '';
    addTaetigkeit(name, minutes);
  }

  function addVorgegebeneTaetigkeit(name: string): void {
    const aktivitaeten = persistence.loadTimeDistribution(day) ?? [];
    if (aktivitaeten.some((activity) => activity.name === name)) {
      fehlermeldung = 'Diese Tätigkeit gibt es schon.';
      render();
      return;
    }
    addTaetigkeit(name, 0);
  }

  function entferneTaetigkeit(index: number): void {
    const aktivitaeten = persistence.loadTimeDistribution(day) ?? [];
    persist(aktivitaeten.filter((_, i) => i !== index));
    render();
  }

  function aendereDauer(index: number, minutes: number): void {
    const aktivitaeten = persistence.loadTimeDistribution(day) ?? [];
    const gesamt = totalIndustrialMinutes(day);
    const rest = aktivitaeten
      .filter((_, i) => i !== index)
      .map((activity) => activity.minutes)
      .reduce((prev, cur) => prev + cur, 0);
    if (minutes > gesamt - rest) {
      fehlermeldung = 'So viel Zeit ist nicht mehr frei.';
      minutes = Math.max(0, gesamt - rest);
    } else {
      fehlermeldung = undefined;
    }
    persist(
      aktivitaeten.map((activity, i) =>
        i === index ? new Activity(activity.name, minutes) : activity,
      ),
    );
    render();
  }

  function aendereProzent(index: number, percent: number): void {
    const gesamt = totalIndustrialMinutes(day);
    aendereDauer(index, Math.round((gesamt * percent) / 100));
  }

  function parseDecimal(value: string): number {
    return parseFloat(value.replace(',', '.')) || 0;
  }

  function formatIndustrial(minutes: number): string {
    return (minutes / 100).toFixed(2).replace('.', ',');
  }

  function formatIndustrialQuarterPrecision(minutes: number): string {
    return formatIndustrial(Math.round(minutes / 25) * 25);
  }

  function formatPercent(minutes: number, gesamt: number): string {
    if (gesamt === 0) return '0 %';
    return `${((100 * minutes) / gesamt).toFixed(1).replace('.', ',')} %`;
  }

  function renderRow(
    activity: Activity,
    index: number,
    gesamt: number,
  ): string {
    return `
      <li class="zeit-verteilung__row mat-list-item" data-index="${index}">
        <div class="zeit-verteilung__taetigkeit">
          <span class="zeit-verteilung__name" data-testid="taetigkeit-${index}">${activity.name}</span>
          <span class="zeit-verteilung__indizes">${formatIndustrial(activity.minutes)} / ${formatIndustrialQuarterPrecision(activity.minutes)}</span>
        </div>
        <input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" value="${formatIndustrial(activity.minutes)}" data-industriezeit-index="${index}" aria-label="Dauer in Industriezeit für ${activity.name}" />
        <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" value="${formatPercent(activity.minutes, gesamt)}" data-prozent-index="${index}" aria-label="Dauer in Prozent für ${activity.name}" />
        <button type="button" class="zeit-verteilung__delete" data-action="delete-${index}" data-testid="delete-taetigkeit-${index}" aria-label="${activity.name} entfernen">${icon('delete')}</button>
      </li>`;
  }

  function render(): void {
    const gesamt = totalIndustrialMinutes(day);
    const aktivitaeten = persistence.loadTimeDistribution(day) ?? [];
    const verplant = verteilteMinuten(aktivitaeten);
    const unverteilt = Math.max(0, gesamt - verplant);
    const vorschlaege = DEFAULT_ACTIVITIES.filter(
      (name) => !aktivitaeten.some((activity) => activity.name === name),
    );

    el.innerHTML = `
      <header class="zeit-verteilung__header">
        <h1 data-testid="zeitverteilung-title">Zeitverteilung für den ${day}</h1>
        <button type="button" class="zeit-verteilung__back" data-action="back" data-testid="back-to-dayplan" aria-label="Zurück zum Tagesplan">${icon('arrow-back')}</button>
      </header>
      <p class="zeit-verteilung__gesamt">
        Gesamtdauer: <span data-testid="zeitverteilung-gesamt">${formatIndustrial(gesamt)}</span>
        <span class="zeit-verteilung__gesamt-rund">/ ${formatIndustrialQuarterPrecision(gesamt)}</span>
        Industriezeit
      </p>
      <div class="zeit-verteilung__neu">
        <input class="zeit-verteilung__input" type="text" placeholder="Neue Tätigkeit" value="${neueTaetigkeit}" data-testid="neue-taetigkeit" data-neue-taetigkeit />
        <input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" placeholder="Industriezeit" data-testid="neue-taetigkeit-industriezeit" aria-label="Dauer in Industriezeit" />
        <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" placeholder="%" data-testid="neue-taetigkeit-prozent" aria-label="Dauer in Prozent" />
        <button type="button" class="zeit-verteilung__add" data-action="add-freitext" data-testid="add-taetigkeit" aria-label="Tätigkeit hinzufügen">${icon('check')}</button>
      </div>
      ${
        vorschlaege.length > 0
          ? `
      <div class="zeit-verteilung__vorschlaege">
        ${vorschlaege.map((name) => `<button type="button" class="mat-button zeit-verteilung__vorschlag" data-vorschlag="${name}">${name}</button>`).join('')}
      </div>`
          : ''
      }
      <ul class="zeit-verteilung__liste mat-list">
        ${aktivitaeten.map((activity, index) => renderRow(activity, index, gesamt)).join('')}
        <li class="zeit-verteilung__row zeit-verteilung__row--unverteilt mat-list-item">
          <div class="zeit-verteilung__taetigkeit">
            <span class="zeit-verteilung__name" data-testid="unverteilt-name">${UNVERTEILTE_ZEIT}</span>
            <span class="zeit-verteilung__indizes" data-testid="unverteilt-industriezeit">${formatIndustrial(unverteilt)} / ${formatIndustrialQuarterPrecision(unverteilt)}</span>
          </div>
          <span class="zeit-verteilung__input zeit-verteilung__input--readonly" data-testid="unverteilt-minuten">${formatIndustrial(unverteilt)}</span>
          <span class="zeit-verteilung__input zeit-verteilung__input--readonly zeit-verteilung__input--percent" data-testid="unverteilt-prozent">${formatPercent(unverteilt, gesamt)}</span>
          <span class="zeit-verteilung__delete"></span>
        </li>
      </ul>
      ${fehlermeldung ? `<div class="zeit-verteilung__fehler" data-testid="zeitverteilung-fehler" role="alert">${fehlermeldung}</div>` : ''}
      <button type="button" class="mat-button zeit-verteilung__back-label" data-action="back" data-testid="back-to-dayplan-label">Zurück zum Tagesplan</button>`;

    const freitextInput = el.querySelector<HTMLInputElement>(
      '[data-neue-taetigkeit]',
    );
    freitextInput?.addEventListener('input', (e) => {
      neueTaetigkeit = (e.target as HTMLInputElement).value;
    });

    el.querySelectorAll<HTMLInputElement>('[data-industriezeit-index]').forEach(
      (input) => {
        const index = parseInt(input.dataset.industriezeitIndex ?? '', 10);
        input.addEventListener('change', (e) => {
          aendereDauer(
            index,
            hoursToIndustrialMinutes(
              parseDecimal((e.target as HTMLInputElement).value),
            ),
          );
        });
      },
    );

    el.querySelectorAll<HTMLInputElement>('[data-prozent-index]').forEach(
      (input) => {
        const index = parseInt(input.dataset.prozentIndex ?? '', 10);
        input.addEventListener('change', (e) => {
          aendereProzent(
            index,
            parseDecimal((e.target as HTMLInputElement).value),
          );
        });
      },
    );

    el.querySelectorAll('[data-vorschlag]').forEach((button) => {
      button.addEventListener('click', () => {
        addVorgegebeneTaetigkeit(button.getAttribute('data-vorschlag') ?? '');
      });
    });

    const actions: Record<string, () => void> = {
      'add-freitext': addFreitextTaetigkeit,
      back: () => onBack?.(),
    };
    aktivitaeten.forEach((_, index) => {
      actions[`delete-${index}`] = () => entferneTaetigkeit(index);
    });
    bindActions(el, actions);
  }

  function update(newDay: string): void {
    day = newDay;
    neueTaetigkeit = '';
    fehlermeldung = undefined;
    render();
  }

  render();
  return { element: el, update };
}
