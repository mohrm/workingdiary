import type { Component } from '../../../component';
import type { Section } from '../../../model/Section';
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

export function createAbschnittListe(
  day: string,
  onAbschnitteChange?: (sections: Section[]) => void,
): AbschnittListeComponent {
  const el = document.createElement('div');
  el.className = 'abschnitt-liste-host';

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
      <div class="abschnitt-liste">
        <ul class="abschnitt-liste__list mat-list">
          ${abschnitte
            .map(
              (_abschnitt, i) => `
            <li class="mat-list-item abschnitt-item" data-index="${i}" data-testid="section-${i}">
              <div class="abschnitt-cell" data-section-index="${i}"></div>
            </li>
          `,
            )
            .join('')}
        </ul>
      </div>`;

    el.querySelectorAll<HTMLElement>('[data-section-index]').forEach((cell) => {
      const index = parseInt(cell.dataset.sectionIndex!, 10);
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
      );
      cell.appendChild(controller.element);

      const deleteBtn = document.createElement('span');
      deleteBtn.setAttribute('data-action', 'delete');
      deleteBtn.setAttribute('data-index', String(index));
      deleteBtn.innerHTML = icon('delete');
      deleteBtn.addEventListener('click', () => {
        entferneAbschnitt(index);
      });
      cell.appendChild(deleteBtn);

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
