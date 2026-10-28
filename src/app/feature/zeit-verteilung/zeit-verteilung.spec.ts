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

function fireClick(el: Element, selector: string): void {
  const target = el.querySelector(selector) as unknown as {
    dispatchEvent: (event: { type: string }) => void;
  };
  target.dispatchEvent({ type: 'click' });
}

function fireChange(el: Element, selector: string, value: string): void {
  const input = el.querySelector(selector) as unknown as FakeInputLike;
  input.value = value;
  input.dispatchEvent({ type: 'change' });
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
    // quarter-hour-rounded total rides along, like on the day plan
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

  it('fügt eine Freitext-Tätigkeit mit Industriezeit hinzu und zeigt sie nach dem Bestätigen weiter an', () => {
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
    assert.equal(gespeichert?.[0].name, 'Review');
    assert.equal(gespeichert?.[0].minutes, 150);
    // the value must survive the re-render as a valid input value
    assert.ok(
      verteilung.element.innerHTML.includes(
        'value="1,50" data-industriezeit-index="0"',
      ),
    );
    // percent of the day's total (150 / 400)
    assert.ok(verteilung.element.innerHTML.includes('value="37,5 %"'));
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
    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-industriezeit"]',
      '0,25',
    );
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

  it('bietet vorgegebene Tätigkeiten zur Auswahl an und legt sie ohne Dauer an', () => {
    saveHourDay('01.01.2024', 1);
    const verteilung = createZeitVerteilung('01.01.2024');

    const vorschlag = verteilung.element.querySelector(
      '[data-vorschlag]',
    ) as unknown as {
      getAttribute: (name: string) => string | null;
      dispatchEvent: (event: { type: string }) => void;
    };
    assert.ok(vorschlag);
    vorschlag.dispatchEvent({ type: 'click' });

    const gespeichert = persistence.loadTimeDistribution('01.01.2024');
    assert.equal(gespeichert?.length, 1);
    assert.equal(gespeichert?.[0].minutes, 0);
    assert.equal(
      gespeichert?.[0].name,
      vorschlag.getAttribute('data-vorschlag'),
    );
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
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="unverteilt-industriezeit">3,00 / 3,00',
      ),
    );
  });

  it('ändert die Dauer einer Tätigkeit und klemmt sie auf den verbleibenden Rest', () => {
    saveHourDay('01.01.2024', 2);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Meetings', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    fireChange(verteilung.element, '[data-industriezeit-index="0"]', '1,5');
    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      150,
    );

    fireChange(verteilung.element, '[data-industriezeit-index="0"]', '5');
    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      200,
    );
    assert.ok(
      verteilung.element.innerHTML.includes(
        'So viel Zeit ist nicht mehr frei.',
      ),
    );
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="unverteilt-minuten">0,00',
      ),
    );
  });

  it('ändert die Dauer auch über die Prozent-Eingabe', () => {
    saveHourDay('01.01.2024', 8);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Meetings', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    fireChange(verteilung.element, '[data-prozent-index="0"]', '50');

    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      400,
    );
    assert.ok(
      verteilung.element.innerHTML.includes(
        'value="4,00" data-industriezeit-index="0"',
      ),
    );
  });

  it('löscht eine Tätigkeit', () => {
    saveHourDay('01.01.2024', 2);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Meetings', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    fireClick(verteilung.element, '[data-testid="delete-taetigkeit-0"]');

    assert.deepEqual(persistence.loadTimeDistribution('01.01.2024'), []);
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="unverteilt-minuten">2,00',
      ),
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
