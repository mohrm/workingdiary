import type { Component } from '../../../component';
import type { Section } from '../../../model/Section';
import type { SectionValidationError } from '../../../model/section-validation';
import { validateSection } from '../../../model/section-validation';
import { persistence } from '../../../services/persistence';
import { icon } from '../../icons';
import {
  type AbschnittComponent,
  createAbschnitt,
} from '../abschnitt/abschnitt';

export interface AbschnittListeComponent extends Component {
  update: (day: string) => void;
  addAbschnitt: (section: Section) => void;
}

interface UndoState {
  section: Section;
  index: number;
}

export function createAbschnittListe(
  day: string,
  onAbschnitteChange?: (sections: Section[]) => void,
): AbschnittListeComponent {
  const el = document.createElement('div');
  el.className = 'abschnitt-liste-host abschnitt-liste';

  let abschnitte: Section[] = persistence.loadSections(day) ?? [];
  let itemControllers: AbschnittComponent[] = [];
  let editIndex = -1;
  let undoState: UndoState | undefined;
  let validationError: SectionValidationError | undefined;

  function persistAbschnitte(): void {
    persistence.saveSections(day, abschnitte);
    onAbschnitteChange?.(abschnitte);
  }

  function addAbschnitt(section: Section): void {
    abschnitte = [...abschnitte, section];
    undoState = undefined;
    persistAbschnitte();
    render();
  }

  function entferneAbschnitt(index: number): void {
    undoState = { section: abschnitte[index], index };
    abschnitte = abschnitte.filter((_, i) => i !== index);
    if (index === editIndex) {
      editIndex = -1;
    } else if (index < editIndex) {
      editIndex -= 1;
    }
    persistAbschnitte();
    render();
  }

  function macheLoeschungRueckgaengig(): void {
    if (!undoState) return;
    const { section, index } = undoState;
    undoState = undefined;
    abschnitte = [
      ...abschnitte.slice(0, index),
      section,
      ...abschnitte.slice(index),
    ];
    if (index <= editIndex) {
      editIndex += 1;
    }
    persistAbschnitte();
    render();
  }

  function aendereAbschnitt(index: number, newSection: Section): void {
    abschnitte = abschnitte.map((v, i) => (i === index ? newSection : v));
    undoState = undefined;
    validationError = undefined;
    persistAbschnitte();
    editIndex = -1;
    render();
  }

  function zeigeValidierungsfehler(error: SectionValidationError): void {
    validationError = error;
    render();
  }

  function versteckeValidierungsfehler(): void {
    validationError = undefined;
    render();
  }

  // Dismissing only forgets the undo state: the deletion was already
  // persisted, and nothing else about the list changed.
  function versteckeUndoToast(): void {
    undoState = undefined;
    render();
  }

  function renderValidationErrorToast(): string {
    if (!validationError) return '';
    return `
      <div class="abschnitt-liste__undo-toast abschnitt-liste__validation-toast" data-testid="validation-toast" role="alert">
        <span>${validationError.message}</span>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-validation" aria-label="Meldung ausblenden">${icon('close')}</button>
      </div>`;
  }

  function renderUndoToast(): string {
    if (!undoState) return '';
    return `
      <div class="abschnitt-liste__undo-toast" data-testid="undo-toast" role="status">
        <span>Abschnitt gelöscht.</span>
        <button type="button" class="abschnitt-liste__undo-button" data-action="undo">Rückgängig</button>
        <button type="button" class="abschnitt-liste__undo-close" data-action="dismiss-undo" aria-label="Meldung ausblenden">${icon('close')}</button>
      </div>`;
  }

  function render() {
    itemControllers.forEach((c) => {
      c.element.remove();
    });
    itemControllers = [];

    el.innerHTML = `
      <div class="abschnitt-row abschnitt-liste__header">
        <div class="abschnitt-time-range">
          <span class="abschnitt-time-cell">Start</span>
          <span class="abschnitt-time-sep abschnitt-liste__header-filler" aria-hidden="true">:</span>
          <span class="abschnitt-time-cell abschnitt-liste__header-filler" aria-hidden="true"></span>
          <span class="abschnitt-time-sep abschnitt-time-sep--range" aria-hidden="true"> - </span>
          <span class="abschnitt-time-cell">Ende</span>
          <span class="abschnitt-time-sep abschnitt-liste__header-filler" aria-hidden="true">:</span>
          <span class="abschnitt-time-cell abschnitt-liste__header-filler" aria-hidden="true"></span>
        </div>
        <span class="abschnitt-location-cell abschnitt-liste__header-location">Arbeitsort</span>
      </div>
      <ul class="abschnitt-liste__list mat-list">
        ${abschnitte
          .map(
            (_abschnitt, i) => `
          <li class="mat-list-item abschnitt-item" data-index="${i}" data-testid="section-${i}"></li>
        `,
          )
          .join('')}
      </ul>
      ${renderUndoToast()}
      ${renderValidationErrorToast()}`;

    el.querySelectorAll<HTMLElement>('[data-index]').forEach((li) => {
      const index = parseInt(li.dataset.index!, 10);
      const abschnitt = abschnitte[index];
      const isEditing = index === editIndex;
      const controller = createAbschnitt(
        abschnitt,
        (newSection) => aendereAbschnitt(index, newSection),
        isEditing,
        (editing) => {
          if (!editing) editIndex = -1;
          else editIndex = index;
          render();
        },
        () => entferneAbschnitt(index),
        (newSection) =>
          validateSection(
            newSection,
            abschnitte.filter((_, i) => i !== index),
          ),
        (error) => zeigeValidierungsfehler(error),
      );
      controller.element.classList.add('abschnitt-cell');
      li.appendChild(controller.element);

      itemControllers.push(controller);
    });

    bindToastActions();
  }

  function bindToastActions(): void {
    el.querySelector('[data-action="undo"]')?.addEventListener(
      'click',
      macheLoeschungRueckgaengig,
    );
    el.querySelector('[data-action="dismiss-undo"]')?.addEventListener(
      'click',
      versteckeUndoToast,
    );
    el.querySelector('[data-action="dismiss-validation"]')?.addEventListener(
      'click',
      versteckeValidierungsfehler,
    );
  }

  function update(newDay: string): void {
    day = newDay;
    abschnitte = persistence.loadSections(day) ?? [];
    editIndex = -1;
    undoState = undefined;
    validationError = undefined;
    render();
  }

  render();
  return { element: el, update, addAbschnitt };
}
