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
    const anteil = Math.max(0, Math.min(minutes, frei));
    if (minutes > frei) {
      fehlermeldung = 'So viel Zeit ist nicht mehr frei.';
      render();
      return false;
    }
    fehlermeldung = undefined;
    persist([...aktivitaeten, new Activity(trimmed, anteil)]);
    render();
    return true;
  }

  function addFreitextTaetigkeit(): void {
    const input = el.querySelector<HTMLInputElement>(
      '[data-testid="neue-taetigkeit"]',
    );
    const minutesInput = el.querySelector<HTMLInputElement>(
      '[data-testid="neue-taetigkeit-minuten"]',
    );
    const name = input?.value ?? neueTaetigkeit;
    const hours = parseHours(minutesInput?.value ?? '');
    neueTaetigkeit = '';
    addTaetigkeit(name, hoursToIndustrialMinutes(hours));
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

  function aendereMinuten(index: number, minutes: number): void {
    const aktivitaeten = persistence.loadTimeDistribution(day) ?? [];
    const gesamt = totalIndustrialMinutes(day);
    const rest = aktivitaeten
      .filter((_, i) => i !== index)
      .map((activity) => activity.minutes)
      .reduce((prev, cur) => prev + cur, 0);
    const anteil = Math.max(0, Math.min(minutes, gesamt - rest));
    persist(
      aktivitaeten.map((activity, i) =>
        i === index ? new Activity(activity.name, anteil) : activity,
      ),
    );
    render();
  }

  function parseHours(value: string): number {
    return parseFloat(value.replace(',', '.')) || 0;
  }

  function renderRow(activity: Activity, index: number): string {
    return `
      <li class="zeit-verteilung__row mat-list-item" data-index="${index}">
        <span class="zeit-verteilung__name" data-testid="taetigkeit-${index}">${activity.name}</span>
        <input class="zeit-verteilung__minuten" type="number" min="0" step="0.01" value="${(activity.minutes / 100).toFixed(2).replace('.', ',')}" data-minuten-index="${index}" aria-label="Dauer in Industrieminuten für ${activity.name}" />
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
      </header>
      <p class="zeit-verteilung__gesamt">
        Gesamtdauer: <span data-testid="zeitverteilung-gesamt">${(gesamt / 100).toFixed(2).replace('.', ',')}</span> Industrieminuten
      </p>
      <div class="zeit-verteilung__neu">
        <input class="zeit-verteilung__input" type="text" placeholder="Neue Tätigkeit" value="${neueTaetigkeit}" data-testid="neue-taetigkeit" data-neue-taetigkeit />
        <input class="zeit-verteilung__input zeit-verteilung__input--minuten" type="number" min="0" step="0.01" placeholder="Dauer" data-testid="neue-taetigkeit-minuten" />
        <button type="button" class="mat-button zeit-verteilung__add" data-action="add-freitext" data-testid="add-taetigkeit">${icon('check')}Hinzufügen</button>
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
        ${aktivitaeten.map((activity, index) => renderRow(activity, index)).join('')}
        <li class="zeit-verteilung__row zeit-verteilung__row--unverteilt mat-list-item">
          <span class="zeit-verteilung__name" data-testid="unverteilt-name">${UNVERTEILTE_ZEIT}</span>
          <span class="zeit-verteilung__minuten zeit-verteilung__minuten--fix" data-testid="unverteilt-minuten">${(unverteilt / 100).toFixed(2).replace('.', ',')}</span>
          <span class="zeit-verteilung__delete"></span>
        </li>
      </ul>
      ${fehlermeldung ? `<div class="zeit-verteilung__fehler" data-testid="zeitverteilung-fehler" role="alert">${fehlermeldung}</div>` : ''}
      <button type="button" class="mat-button zeit-verteilung__back" data-action="back" data-testid="back-to-dayplan">${icon('logout')}Zurück zum Tagesplan</button>`;

    const freitextInput = el.querySelector<HTMLInputElement>(
      '[data-neue-taetigkeit]',
    );
    freitextInput?.addEventListener('input', (e) => {
      neueTaetigkeit = (e.target as HTMLInputElement).value;
    });

    el.querySelectorAll<HTMLInputElement>('[data-minuten-index]').forEach(
      (input) => {
        const index = parseInt(input.dataset.minutenIndex ?? '', 10);
        input.addEventListener('change', (e) => {
          aendereMinuten(
            index,
            hoursToIndustrialMinutes(
              parseHours((e.target as HTMLInputElement).value),
            ),
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
