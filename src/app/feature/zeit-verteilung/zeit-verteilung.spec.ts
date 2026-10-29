import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { Activity, hoursToIndustrialMinutes } from '../../model/activities';
import { LOCATIONS } from '../../model/locations';
import { Section } from '../../model/Section';
import { Time } from '../../model/Time';
import { persistence } from '../../services/persistence';
import { installFakeDocument } from '../../test-utils';
import { createZeitVerteilung } from './zeit-verteilung';

interface FakeInputLike {
  value: string;
  dispatchEvent: (event: { type: string }) => void;
}

function setInput(el: Element, selector: string, value: string): void {
  const input = el.querySelector(selector) as unknown as FakeInputLike;
  input.value = value;
  input.dispatchEvent({ type: 'input' });
}
function oeffneVerlauf(el: Element): void {
  const input = el.querySelector(
    '[data-testid="neue-taetigkeit"]',
  ) as unknown as {
    dispatchEvent: (event: { type: string }) => void;
  };
  input.dispatchEvent({ type: 'focus' });
}

function verlaufNamen(el: Element): string[] {
  return [...el.querySelectorAll('[data-verlauf-name]')].map(
    (e) => (e as Element).getAttribute('data-verlauf-name') ?? '',
  );
}

function fireClick(el: Element, selector: string): void {
  const target = el.querySelector(selector) as unknown as {
    dispatchEvent: (event: { type: string }) => void;
  };
  target.dispatchEvent({ type: 'click' });
}

function saveHourDay(day: string, hours: number): void {
  persistence.saveSections(day, [
    new Section(new Time(8, 0), new Time(8 + hours, 0), LOCATIONS.OFFICE),
  ]);
}

describe('ZeitVerteilung', () => {
  beforeEach(() => {
    localStorage.clear();
    installFakeDocument();
  });

  it('zeigt die Gesamtdauer des Tages in Industriezeit an (7:45 h = 7,75)', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(15, 45), LOCATIONS.OFFICE),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    assert.ok(
      verteilung.element.innerHTML.includes(
        '<span data-testid="zeitverteilung-gesamt">7,75</span>',
      ),
    );
    assert.ok(verteilung.element.innerHTML.includes('/ 7,75'));
  });

  it('zeigt bei Tag ohne Abschnitte 0,00 an und funktioniert trotzdem', () => {
    const verteilung = createZeitVerteilung('01.01.2024');

    assert.ok(
      verteilung.element.innerHTML.includes(
        '<span data-testid="zeitverteilung-gesamt">0,00</span>',
      ),
    );
    assert.ok(verteilung.element.innerHTML.includes('nicht verteilte Zeit'));
  });

  it('fügt eine Freitext-Tätigkeit mit Industriezeit hinzu und zeigt sie weiter an', () => {
    saveHourDay('01.01.2024', 4);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Review');
    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-industriezeit"]',
      '1,5',
    );
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    const gespeichert = persistence.loadTimeDistribution('01.01.2024');
    assert.equal(gespeichert?.length, 1);
    assert.equal(gespeichert?.[0].minutes, 150);
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="taetigkeit-industriezeit-0">1,50',
      ),
    );
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="taetigkeit-prozent-0">37,5 %',
      ),
    );
  });

  it('nimmt die Dauer einer neuen Tätigkeit auch in Prozent entgegen', () => {
    saveHourDay('01.01.2024', 8);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Pause');
    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-prozent"]',
      '25',
    );
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      200,
    );
  });

  it('lehnt eine Tätigkeit ohne Namen und Duplikate ab', () => {
    saveHourDay('01.01.2024', 1);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', '   ');
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');
    assert.ok(
      verteilung.element.innerHTML.includes('Bitte eine Tätigkeit angeben.'),
    );

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Testen');
    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-industriezeit"]',
      '0,5',
    );
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Testen');
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');
    assert.ok(
      verteilung.element.innerHTML.includes('Diese Tätigkeit gibt es schon.'),
    );
    assert.equal(persistence.loadTimeDistribution('01.01.2024')?.length, 1);
  });

  it('lehnt eine Dauer ab, die die verbleibende Zeit übersteigt', () => {
    saveHourDay('01.01.2024', 1);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Alles');
    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-industriezeit"]',
      '9',
    );
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    assert.ok(
      verteilung.element.innerHTML.includes(
        'So viel Zeit ist nicht mehr frei.',
      ),
    );
    assert.equal(persistence.loadTimeDistribution('01.01.2024'), undefined);
  });

  it('bietet früher verwendete Tätigkeiten der letzten N Monate zur Auswahl an', () => {
    saveHourDay('01.01.2024', 1);
    persistence.saveTimeDistribution('01.11.2023', [
      new Activity('Review', 50),
      new Activity('Meetings', 50),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    assert.ok(verteilung.element.innerHTML.includes('z. B. Regulatorik'));
    oeffneVerlauf(verteilung.element);
    assert.deepEqual(verlaufNamen(verteilung.element), ['Review', 'Meetings']);
  });

  it('zeigt beim erneuten Öffnen auch Posten, die unterdessen auf einem anderen Tag ergänzt wurden', () => {
    saveHourDay('01.01.2024', 1);
    persistence.saveTimeDistribution('31.12.2023', [
      new Activity('Review', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    oeffneVerlauf(verteilung.element);
    assert.deepEqual(verlaufNamen(verteilung.element), ['Review']);

    // zweiter Posten entsteht, während dieser Bildschirm offen ist
    persistence.saveTimeDistribution('31.12.2023', [
      new Activity('Review', 100),
      new Activity('Meetings', 200),
    ]);

    oeffneVerlauf(verteilung.element);
    assert.deepEqual(verlaufNamen(verteilung.element), ['Review', 'Meetings']);
  });

  it('öffnet die Auswahlliste beim Fokussieren und übernimmt eine Auswahl ins Feld', () => {
    saveHourDay('01.01.2024', 1);
    persistence.saveTimeDistribution('01.12.2023', [
      new Activity('Review', 50),
      new Activity('Meetings', 50),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    const input = verteilung.element.querySelector(
      '[data-testid="neue-taetigkeit"]',
    ) as unknown as {
      value: string;
      dispatchEvent: (event: { type: string }) => void;
      getAttribute: (name: string) => string | null;
    };
    const liste = verteilung.element.querySelector(
      '[data-testid="taetigkeit-verlauf"]',
    ) as unknown as { hidden: boolean };
    assert.equal(liste.hidden, true);

    input.dispatchEvent({ type: 'focus' });
    assert.equal(liste.hidden, false);
    assert.equal(input.getAttribute('aria-expanded'), 'true');

    // Eingabe filtert die Liste
    input.value = 'meet';
    input.dispatchEvent({ type: 'input' });
    const eintraege = verteilung.element.querySelectorAll(
      '[data-verlauf-name]',
    ) as unknown as {
      getAttribute: (n: string) => string | null;
      hidden: boolean;
    }[];
    assert.equal(eintraege[0].getAttribute('data-verlauf-name'), 'Review');
    assert.equal(eintraege[0].hidden, true);
    assert.equal(eintraege[1].hidden, false);

    // Klick übernimmt den Namen ins Feld
    const wahl = verteilung.element.querySelector(
      '[data-verlauf-name="Meetings"]',
    ) as unknown as { dispatchEvent: (e: { type: string }) => void };
    wahl.dispatchEvent({ type: 'click' });
    assert.equal(input.value, 'Meetings');
    assert.equal(liste.hidden, true);
  });

  it('übernimmt die vorgegebene Dauer direkt bei der Auswahl aus der Combobox', () => {
    saveHourDay('01.01.2024', 4);
    persistence.saveTimeDistribution('01.12.2023', [
      new Activity('Review', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-industriezeit"]',
      '1,5',
    );
    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Review');
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    const gespeichert = persistence.loadTimeDistribution('01.01.2024');
    assert.equal(gespeichert?.[0].name, 'Review');
    assert.equal(gespeichert?.[0].minutes, 150);
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="taetigkeit-industriezeit-0">1,50',
      ),
    );
    // die Dauerfelder werden nach dem Übernehmen zurückgesetzt
    const dauerFeld = verteilung.element.querySelector(
      '[data-testid="neue-taetigkeit-industriezeit"]',
    ) as unknown as { value: string };
    assert.equal(dauerFeld.value, '');
  });

  it('übernimmt bei der Combobox-Auswahl auch eine Prozent-Vorgabe', () => {
    saveHourDay('01.01.2024', 8);
    persistence.saveTimeDistribution('01.12.2023', [
      new Activity('Review', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-prozent"]',
      '25',
    );
    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Review');
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      200,
    );
  });

  it('fügt eine Combobox-Auswahl mit 0 hinzu, wenn keine Dauer vorgegeben ist', () => {
    saveHourDay('01.01.2024', 4);
    persistence.saveTimeDistribution('01.12.2023', [
      new Activity('Review', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Review');
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      0,
    );
  });

  it('bietet keine Tätigkeiten an, die älter als N Monate sind, und keine bereits gewählten', () => {
    saveHourDay('01.01.2024', 4);
    persistence.saveTimeDistribution('01.08.2023', [
      new Activity('Alte Tätigkeit', 100),
    ]);
    persistence.saveTimeDistribution('01.12.2023', [
      new Activity('Review', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    oeffneVerlauf(verteilung.element);
    assert.deepEqual(verlaufNamen(verteilung.element), ['Review']);

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Review');
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    oeffneVerlauf(verteilung.element);
    assert.deepEqual(verlaufNamen(verteilung.element), []);
  });

  it('respektiert einen konfigurierten Verlaufszeitraum in Monaten', () => {
    localStorage.setItem('activity-history-months', '12');
    saveHourDay('01.01.2024', 1);
    persistence.saveTimeDistribution('01.06.2023', [
      new Activity('Halbjahresaufgabe', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    oeffneVerlauf(verteilung.element);
    assert.deepEqual(verlaufNamen(verteilung.element), ['Halbjahresaufgabe']);
  });

  it('zeigt die nicht verteilte Zeit als fixen Posten an, mit Anteil in Prozent', () => {
    saveHourDay('01.01.2024', 8);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Programmierung', 500),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="unverteilt-minuten">3,00',
      ),
    );
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="unverteilt-prozent">37,5 %',
      ),
    );
  });

  it('bearbeitet eine Tätigkeit über die Edit-Mechanik und übernimmt die neue Dauer', () => {
    saveHourDay('01.01.2024', 2);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Meetings', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    fireClick(verteilung.element, '[data-action="edit"]');
    assert.ok(
      verteilung.element.innerHTML.includes('[data-edit-industriezeit]') ||
        verteilung.element.innerHTML.includes('data-edit-industriezeit'),
    );

    setInput(verteilung.element, '[data-edit-industriezeit]', '1,5');
    fireClick(verteilung.element, '[data-action="finish"]');

    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      150,
    );
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="taetigkeit-industriezeit-0">1,50',
      ),
    );
  });

  it('bricht das Bearbeiten ab, ohne die gespeicherte Dauer zu ändern', () => {
    saveHourDay('01.01.2024', 2);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Meetings', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    fireClick(verteilung.element, '[data-action="edit"]');
    setInput(verteilung.element, '[data-edit-industriezeit]', '1,5');
    fireClick(verteilung.element, '[data-action="abort"]');

    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      100,
    );
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="taetigkeit-industriezeit-0">1,00',
      ),
    );
  });

  it('ändert die Dauer im Editor auch in Prozent und klemmt auf den Rest', () => {
    saveHourDay('01.01.2024', 8);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Meetings', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    fireClick(verteilung.element, '[data-action="edit"]');
    setInput(verteilung.element, '[data-edit-prozent]', '50');
    fireClick(verteilung.element, '[data-action="finish"]');
    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      400,
    );

    fireClick(verteilung.element, '[data-action="edit"]');
    setInput(verteilung.element, '[data-edit-industriezeit]', '9');
    fireClick(verteilung.element, '[data-action="finish"]');
    assert.ok(
      verteilung.element.innerHTML.includes(
        'So viel Zeit ist nicht mehr frei.',
      ),
    );
    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      400,
    );
  });

  it('löscht eine Tätigkeit direkt aus der Listenzeile', () => {
    saveHourDay('01.01.2024', 2);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Meetings', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    fireClick(verteilung.element, '[data-action="delete"]');

    assert.deepEqual(persistence.loadTimeDistribution('01.01.2024'), []);
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="unverteilt-minuten">2,00',
      ),
    );
  });

  it('bearbeitet und löscht jede Zeile einzeln, auch bei mehreren Tätigkeiten', () => {
    saveHourDay('01.01.2024', 4);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Review', 100),
      new Activity('Meetings', 100),
      new Activity('Support', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    // edit icon of the first row still works when later rows exist
    const rows = verteilung.element.querySelectorAll('[data-index]');
    assert.equal(rows.length, 3);
    fireClick(rows[0] as unknown as Element, '[data-action="edit"]');
    assert.ok(verteilung.element.innerHTML.includes('data-edit-industriezeit'));
    setInput(verteilung.element, '[data-edit-industriezeit]', '1,5');
    fireClick(verteilung.element, '[data-action="finish"]');
    const nachEdit = persistence.loadTimeDistribution('01.01.2024');
    assert.equal(nachEdit?.[0].minutes, 150);
    assert.equal(nachEdit?.[1].minutes, 100);

    // delete icon of the middle row
    const rows2 = verteilung.element.querySelectorAll('[data-index]');
    fireClick(rows2[1] as unknown as Element, '[data-action="delete"]');
    const nachDelete = persistence.loadTimeDistribution('01.01.2024');
    assert.deepEqual(
      nachDelete?.map((a) => a.name),
      ['Review', 'Support'],
    );
  });

  it('zeigt den Rundungs-Check als „ok", wenn die gerundeten Posten der gerundeten Summe entsprechen', () => {
    saveHourDay('01.01.2024', 8);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Programmierung', 400),
      new Activity('Meetings', 200),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    const html = verteilung.element.innerHTML;
    assert.ok(html.includes('zeit-verteilung__rundung--ok'));
    assert.ok(html.includes('Rundung passt'));
  });

  it('zeigt den Rundungs-Check mit Abweichung, wenn die gerundeten Posten nicht auf die gerundete Summe passen', () => {
    saveHourDay('01.01.2024', 8);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Programmierung', 112),
      new Activity('Meetings', 112),
      new Activity('Support', 112),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    const html = verteilung.element.innerHTML;
    assert.ok(html.includes('zeit-verteilung__rundung--abweichung'));
    assert.ok(html.includes('Rundung weicht um'));
    // je 112 -> 100 gerundet (Summe 300), unverteilt 464 -> 475 gerundet,
    // Summe 775 gegen gerundete Gesamtsumme 800: Abweichung 25 (= 0,25)
    assert.ok(html.includes('um 0,25 ab ('));
  });

  it('schließt die unverteilte Zeit in den Rundungs-Check ein', () => {
    saveHourDay('01.01.2024', 8);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Programmierung', 112),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    // 112 -> 100 gerundet, 688 unverteilt -> 700 gerundet: 800 = 800, ok
    assert.ok(
      verteilung.element.innerHTML.includes('zeit-verteilung__rundung--ok'),
    );
  });

  it('ruft onBack beim Zurück-Button auf', () => {
    let backCalled = false;
    const verteilung = createZeitVerteilung('01.01.2024', () => {
      backCalled = true;
    });

    fireClick(verteilung.element, '[data-testid="back-to-dayplan"]');

    assert.ok(backCalled);
  });

  it('update() lädt die Verteilung des neuen Tags', () => {
    saveHourDay('01.01.2024', 1);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Meetings', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    verteilung.update('02.01.2024');

    assert.ok(
      verteilung.element.innerHTML.includes(
        'Zeitverteilung für den 02.01.2024',
      ),
    );
    assert.equal(persistence.loadTimeDistribution('02.01.2024'), undefined);
  });
});

describe('Industrial time', () => {
  it('rechnet Dezimalstunden in Industriezeit um (7:45 h = 7,75)', () => {
    assert.equal(hoursToIndustrialMinutes(7.75), 775);
    assert.equal(hoursToIndustrialMinutes(0.25), 25);
  });
});
