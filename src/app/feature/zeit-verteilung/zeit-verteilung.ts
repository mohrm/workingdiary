import type { Component } from '../../component';
import {
  Activity,
  calendarMinutesToIndustrial,
  hoursToIndustrialMinutes,
} from '../../model/activities';
import {
  ACTIVITY_HISTORY_MONTHS_KEY,
  DEFAULT_ACTIVITY_HISTORY_MONTHS,
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

function historyMonths(): number {
  const raw = localStorage.getItem(ACTIVITY_HISTORY_MONTHS_KEY);
  const parsed = raw === null ? Number.NaN : parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ACTIVITY_HISTORY_MONTHS;
}

export function createZeitVerteilung(
  day: string,
  onBack?: () => void,
): ZeitVerteilungComponent {
  const el = document.createElement('section');
  el.className = 'zeit-verteilung';

  let neueTaetigkeit = '';
  let neueIndustriezeit = '';
  let neueProzent = '';
  let fehlermeldung: string | undefined;

  function verteilteMinuten(aktivitaeten: Activity[]): number {
    return aktivitaeten
      .map((activity) => activity.minutes)
      .reduce((prev, cur) => prev + cur, 0);
  }

  function persist(aktivitaeten: Activity[]): void {
    persistence.saveTimeDistribution(day, aktivitaeten);
  }

  function gesamt(): number {
    return totalIndustrialMinutes(day);
  }

  function frei(aktivitaeten: Activity[]): number {
    return gesamt() - verteilteMinuten(aktivitaeten);
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
    if (minutes > frei(aktivitaeten)) {
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
    const name = neueTaetigkeit;
    const minutes = minutesFromNewInputs();
    neueTaetigkeit = '';
    neueIndustriezeit = '';
    neueProzent = '';
    addTaetigkeit(name, minutes);
  }

  function minutesFromNewInputs(): number {
    if (neueProzent !== '') {
      return Math.round((gesamt() * parseDecimal(neueProzent)) / 100);
    }
    return hoursToIndustrialMinutes(parseDecimal(neueIndustriezeit));
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

  function formatPercent(minutes: number, total: number): string {
    if (total === 0) return '0,0 %';
    return `${((100 * minutes) / total).toFixed(1).replace('.', ',')} %`;
  }

  function renderRow(
    activity: Activity,
    index: number,
    isEdit: boolean,
    total: number,
  ): string {
    const industrial = formatIndustrial(activity.minutes);
    const percent = formatPercent(activity.minutes, total);
    return `
      <li class="zeit-verteilung__row mat-list-item" data-index="${index}">
        <span class="zeit-verteilung__name" data-testid="taetigkeit-${index}">${activity.name}</span>
        <span class="zeit-verteilung__indizes" data-testid="taetigkeit-indizes-${index}">${industrial} / ${formatIndustrialQuarterPrecision(activity.minutes)}</span>
        ${
          isEdit
            ? `<input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" value="${industrial}" data-edit-industriezeit aria-label="Industriezeit für ${activity.name}" />
               <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" value="${percent}" data-edit-prozent aria-label="Prozent für ${activity.name}" />`
            : `<span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="taetigkeit-industriezeit-${index}">${industrial}</span>
               <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="taetigkeit-prozent-${index}">${percent}</span>`
        }
        <div class="zeit-verteilung__icon-zone">
          ${
            isEdit
              ? `<span data-action="abort" role="button" aria-label="Abbrechen">${icon('close')}</span>
                 <span data-action="finish" role="button" aria-label="Übernehmen">${icon('check')}</span>`
              : `<span data-action="edit" role="button" aria-label="Bearbeiten">${icon('edit')}</span>`
          }
          <span data-action="delete" role="button" aria-label="${activity.name} entfernen">${icon('delete')}</span>
        </div>
      </li>`;
  }

  function render(): void {
    const total = gesamt();
    const aktivitaeten = persistence.loadTimeDistribution(day) ?? [];
    const unverteilt = Math.max(0, frei(aktivitaeten));
    const vorschlaege = persistence
      .recentActivityNames(day, historyMonths())
      .filter(
        (name) => !aktivitaeten.some((activity) => activity.name === name),
      );

    el.innerHTML = `
      <header class="zeit-verteilung__header">
        <h1 data-testid="zeitverteilung-title">Zeitverteilung für den ${day}</h1>
        <button type="button" class="zeit-verteilung__back" data-action="back" data-testid="back-to-dayplan" aria-label="Zurück zum Tagesplan">${icon('arrow-back')}</button>
      </header>
      <p class="zeit-verteilung__gesamt">
        Gesamtdauer: <span data-testid="zeitverteilung-gesamt">${formatIndustrial(total)}</span>
        <span class="zeit-verteilung__gesamt-rund">/ ${formatIndustrialQuarterPrecision(total)}</span>
        Industriezeit
      </p>
      <div class="zeit-verteilung__neu">
        <div class="zeit-verteilung__name-feld">
          <input class="zeit-verteilung__input" type="text" placeholder="z. B. Regulatorik" value="${neueTaetigkeit}" data-testid="neue-taetigkeit" data-neue-taetigkeit role="combobox" aria-expanded="false" aria-controls="zeit-verteilung-verlauf" aria-autocomplete="list" />
          <ul class="zeit-verteilung__verlauf" id="zeit-verteilung-verlauf" data-testid="taetigkeit-verlauf" role="listbox" hidden>
            ${vorschlaege.map((name) => `<li class="zeit-verteilung__verlauf-eintrag" role="option" data-verlauf-name="${name}">${name}</li>`).join('')}
          </ul>
        </div>
        <input class="zeit-verteilung__input zeit-verteilung__input--industrial" type="text" inputmode="decimal" placeholder="Industriezeit" value="${neueIndustriezeit}" data-testid="neue-taetigkeit-industriezeit" aria-label="Industriezeit" />
        <input class="zeit-verteilung__input zeit-verteilung__input--percent" type="text" inputmode="decimal" placeholder="%" value="${neueProzent}" data-testid="neue-taetigkeit-prozent" aria-label="Prozent" />
        <button type="button" class="zeit-verteilung__add" data-action="add-freitext" data-testid="add-taetigkeit" aria-label="Tätigkeit hinzufügen">${icon('check')}</button>
      </div>
      <ul class="zeit-verteilung__liste mat-list">
        ${aktivitaeten
          .map((activity, index) =>
            renderRow(activity, index, index === editIndex, total),
          )
          .join('')}
        <li class="zeit-verteilung__row zeit-verteilung__row--unverteilt mat-list-item">
          <span class="zeit-verteilung__name" data-testid="unverteilt-name">${UNVERTEILTE_ZEIT}</span>
          <span class="zeit-verteilung__indizes" data-testid="unverteilt-industriezeit">${formatIndustrial(unverteilt)} / ${formatIndustrialQuarterPrecision(unverteilt)}</span>
          <span class="zeit-verteilung__value zeit-verteilung__input--industrial" data-testid="unverteilt-minuten">${formatIndustrial(unverteilt)}</span>
          <span class="zeit-verteilung__value zeit-verteilung__input--percent" data-testid="unverteilt-prozent">${formatPercent(unverteilt, total)}</span>
          <div class="zeit-verteilung__icon-zone zeit-verteilung__icon-zone--leer"></div>
        </li>
      </ul>
      ${fehlermeldung ? `<div class="zeit-verteilung__fehler" data-testid="zeitverteilung-fehler" role="alert">${fehlermeldung}</div>` : ''}`;

    const freitextInput = el.querySelector<HTMLInputElement>(
      '[data-neue-taetigkeit]',
    );
    const verlaufListe = el.querySelector<HTMLElement>(
      '[data-testid="taetigkeit-verlauf"]',
    );
    const verzeichneVerlauf = (): void => {
      if (!freitextInput || !verlaufListe) return;
      const alle = verlaufListe.querySelectorAll('[data-verlauf-name]');
      const suchtext = freitextInput.value.trim().toLowerCase();
      let sichtbar = 0;
      alle.forEach((eintrag) => {
        const name = eintrag.getAttribute('data-verlauf-name') ?? '';
        const passt = suchtext === '' || name.toLowerCase().includes(suchtext);
        (eintrag as HTMLElement).hidden = !passt;
        if (passt) sichtbar++;
      });
      const zeigen = sichtbar > 0;
      verlaufListe.hidden = !zeigen;
      freitextInput.setAttribute('aria-expanded', zeigen ? 'true' : 'false');
    };
    freitextInput?.addEventListener('focus', verzeichneVerlauf);
    freitextInput?.addEventListener('input', (e) => {
      neueTaetigkeit = (e.target as HTMLInputElement).value;
      verzeichneVerlauf();
    });
    freitextInput?.addEventListener('blur', () => {
      window.setTimeout(() => {
        if (verlaufListe) verlaufListe.hidden = true;
        freitextInput?.setAttribute('aria-expanded', 'false');
      }, 150);
    });
    verlaufListe?.querySelectorAll('[data-verlauf-name]').forEach((eintrag) => {
      eintrag.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      eintrag.addEventListener('click', () => {
        const name = eintrag.getAttribute('data-verlauf-name') ?? '';
        neueTaetigkeit = name;
        if (freitextInput) freitextInput.value = name;
        if (verlaufListe) verlaufListe.hidden = true;
        freitextInput?.setAttribute('aria-expanded', 'false');
        freitextInput?.focus();
      });
    });
    const industriezeitInput = el.querySelector<HTMLInputElement>(
      '[data-testid="neue-taetigkeit-industriezeit"]',
    );
    industriezeitInput?.addEventListener('input', (e) => {
      neueIndustriezeit = (e.target as HTMLInputElement).value;
    });
    const prozentInput = el.querySelector<HTMLInputElement>(
      '[data-testid="neue-taetigkeit-prozent"]',
    );
    prozentInput?.addEventListener('input', (e) => {
      neueProzent = (e.target as HTMLInputElement).value;
    });

    el.querySelector<HTMLInputElement>(
      '[data-edit-industriezeit]',
    )?.addEventListener('input', (e) => {
      editIndustriezeit = (e.target as HTMLInputElement).value;
    });
    el.querySelector<HTMLInputElement>('[data-edit-prozent]')?.addEventListener(
      'input',
      (e) => {
        editProzent = (e.target as HTMLInputElement).value;
      },
    );

    aktivitaeten.forEach((activity, index) => {
      const row = el.querySelector(`[data-index="${index}"]`);
      if (!row) return;
      row
        .querySelector('[data-action="edit"]')
        ?.addEventListener('click', () => {
          editIndex = index;
          editIndustriezeit = formatIndustrial(activity.minutes);
          editProzent = '';
          fehlermeldung = undefined;
          render();
        });
      row
        .querySelector('[data-action="abort"]')
        ?.addEventListener('click', () => {
          editIndex = -1;
          editIndustriezeit = '';
          editProzent = '';
          render();
        });
      row
        .querySelector('[data-action="finish"]')
        ?.addEventListener('click', () => {
          const aktivitaetenNow = persistence.loadTimeDistribution(day) ?? [];
          const rest = aktivitaetenNow
            .filter((_, i) => i !== index)
            .map((a) => a.minutes)
            .reduce((prev, cur) => prev + cur, 0);
          let minutes: number;
          if (editProzent !== '') {
            minutes = Math.round((gesamt() * parseDecimal(editProzent)) / 100);
          } else {
            minutes = hoursToIndustrialMinutes(parseDecimal(editIndustriezeit));
          }
          const maxMinutes = gesamt() - rest;
          if (minutes > maxMinutes) {
            fehlermeldung = 'So viel Zeit ist nicht mehr frei.';
            render();
            return;
          }
          fehlermeldung = undefined;
          persist(
            aktivitaetenNow.map((a, i) =>
              i === index ? new Activity(a.name, minutes) : a,
            ),
          );
          editIndex = -1;
          editIndustriezeit = '';
          editProzent = '';
          render();
        });
      row
        .querySelector('[data-action="delete"]')
        ?.addEventListener('click', () => entferneTaetigkeit(index));
    });
    bindActions(el, {
      'add-freitext': addFreitextTaetigkeit,
      back: () => onBack?.(),
    });
  }

  let editIndex = -1;
  let editIndustriezeit = '';
  let editProzent = '';

  function entferneTaetigkeit(index: number): void {
    const aktivitaeten = persistence.loadTimeDistribution(day) ?? [];
    persist(aktivitaeten.filter((_, i) => i !== index));
    if (editIndex === index) {
      editIndex = -1;
    }
    render();
  }

  function update(newDay: string): void {
    day = newDay;
    neueTaetigkeit = '';
    neueIndustriezeit = '';
    neueProzent = '';
    fehlermeldung = undefined;
    editIndex = -1;
    render();
  }

  render();
  return { element: el, update };
}
