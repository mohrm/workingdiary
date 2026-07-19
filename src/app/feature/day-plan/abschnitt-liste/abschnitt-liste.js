import { persistence } from '../../../services/persistence.js';
import { icon } from '../../icons.js';
import { createAbschnitt } from '../abschnitt/abschnitt.js';

export function createAbschnittListe(day, stempelCallback) {
  const el = document.createElement('div');
  el.className = 'abschnitt-liste-host';

  let abschnitte = persistence.loadSections(day) ?? [];
  let itemControllers = [];
  let editIndex = -1;

  function handleStempelEvent(section) {
    abschnitte = [...abschnitte, section];
    persistence.saveSections(day, abschnitte);
    render();
  }

  if (stempelCallback) {
    stempelCallback(handleStempelEvent);
  }

  function entferneAbschnitt(index) {
    abschnitte = abschnitte.filter((_, i) => i !== index);
    persistence.saveSections(day, abschnitte);
    render();
  }

  function aendereAbschnitt(index, newSection) {
    abschnitte = abschnitte.map((v, i) => (i === index ? newSection : v));
    persistence.saveSections(day, abschnitte);
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

    el.querySelectorAll('[data-section-index]').forEach((cell) => {
      const index = parseInt(cell.dataset.sectionIndex, 10);
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

  function update(newDay) {
    day = newDay;
    abschnitte = persistence.loadSections(day) ?? [];
    editIndex = -1;
    render();
  }

  render();
  return { element: el, update };
}
