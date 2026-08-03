import type { Component } from '../../../component';
import type { Section } from '../../../model/Section';
import { persistence } from '../../../services/persistence';
import {
  type AbschnittComponent,
  createAbschnitt,
} from '../abschnitt/abschnitt';

export interface AbschnittListeComponent extends Component {
  update: (day: string) => void;
  addAbschnitt: (section: Section) => void;
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

  function persistAbschnitte(): void {
    persistence.saveSections(day, abschnitte);
    onAbschnitteChange?.(abschnitte);
  }

  function addAbschnitt(section: Section): void {
    abschnitte = [...abschnitte, section];
    persistAbschnitte();
    render();
  }

  function entferneAbschnitt(index: number): void {
    abschnitte = abschnitte.filter((_, i) => i !== index);
    if (index === editIndex) {
      editIndex = -1;
    } else if (index < editIndex) {
      editIndex -= 1;
    }
    persistAbschnitte();
    render();
  }

  function aendereAbschnitt(index: number, newSection: Section): void {
    abschnitte = abschnitte.map((v, i) => (i === index ? newSection : v));
    persistAbschnitte();
    editIndex = -1;
    render();
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
      </ul>`;

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
      );
      controller.element.classList.add('abschnitt-cell');
      li.appendChild(controller.element);

      itemControllers.push(controller);
    });
  }

  function update(newDay: string): void {
    day = newDay;
    abschnitte = persistence.loadSections(day) ?? [];
    editIndex = -1;
    render();
  }

  render();
  return { element: el, update, addAbschnitt };
}
