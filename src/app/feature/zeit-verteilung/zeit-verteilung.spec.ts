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

describe('ZeitVerteilung', () => {
  beforeEach(() => {
    localStorage.clear();
    installFakeDocument();
  });

  it('zeigt die Gesamtdauer des Tages in Industrieminuten an', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(15, 30), LOCATIONS.OFFICE),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    assert.ok(
      verteilung.element.innerHTML.includes(
        '<span data-testid="zeitverteilung-gesamt">7,50</span>',
      ),
    );
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

  it('fügt eine Freitext-Tätigkeit mit Dauer hinzu und persistiert sie', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(12, 0), LOCATIONS.OFFICE),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Review');
    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-minuten"]',
      '1,5',
    );
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    const gespeichert = persistence.loadTimeDistribution('01.01.2024');
    assert.equal(gespeichert?.length, 1);
    assert.equal(gespeichert?.[0].name, 'Review');
    assert.equal(gespeichert?.[0].minutes, 150);
    assert.ok(verteilung.element.innerHTML.includes('Review'));
  });

  it('lehnt eine Freitext-Dauer ab, die die verbleibende Zeit übersteigt', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Alles');
    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-minuten"]',
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

  it('lehnt eine Tätigkeit ohne Namen und Duplikate ab', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', '   ');
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');
    assert.ok(
      verteilung.element.innerHTML.includes('Bitte eine Tätigkeit angeben.'),
    );

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Testen');
    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-minuten"]',
      '0,5',
    );
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');

    setInput(verteilung.element, '[data-testid="neue-taetigkeit"]', 'Testen');
    setInput(
      verteilung.element,
      '[data-testid="neue-taetigkeit-minuten"]',
      '0,25',
    );
    fireClick(verteilung.element, '[data-testid="add-taetigkeit"]');
    assert.ok(
      verteilung.element.innerHTML.includes('Diese Tätigkeit gibt es schon.'),
    );
    assert.equal(persistence.loadTimeDistribution('01.01.2024')?.length, 1);
  });

  it('bietet vorgegebene Tätigkeiten zur Auswahl an und legt sie ohne Dauer an', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    ]);
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

  it('zeigt die nicht verteilte Zeit als fixen Posten an', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(16, 0), LOCATIONS.OFFICE),
    ]);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Programmierung', 500),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    assert.ok(
      verteilung.element.innerHTML.includes(
        '<span class="zeit-verteilung__minuten zeit-verteilung__minuten--fix" data-testid="unverteilt-minuten">3,00</span>',
      ),
    );
  });

  it('klemmt eine geänderte Dauer auf den verbleibenden Rest und persistiert', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(10, 0), LOCATIONS.OFFICE),
    ]);
    persistence.saveTimeDistribution('01.01.2024', [
      new Activity('Meetings', 100),
    ]);
    const verteilung = createZeitVerteilung('01.01.2024');

    fireChange(verteilung.element, '[data-minuten-index="0"]', '5');
    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      200,
    );

    fireChange(verteilung.element, '[data-minuten-index="0"]', '99');
    assert.equal(
      persistence.loadTimeDistribution('01.01.2024')?.[0].minutes,
      200,
    );
    assert.ok(
      verteilung.element.innerHTML.includes(
        'data-testid="unverteilt-minuten">0,00',
      ),
    );
  });

  it('löscht eine Tätigkeit', () => {
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(10, 0), LOCATIONS.OFFICE),
    ]);
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
    persistence.saveSections('01.01.2024', [
      new Section(new Time(8, 0), new Time(9, 0), LOCATIONS.OFFICE),
    ]);
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

describe('Industrial minutes', () => {
  it('konvertiert Dezimalstunden in Industrieminuten und zurück', () => {
    assert.equal(hoursToIndustrialMinutes(7.5), 750);
    assert.equal(hoursToIndustrialMinutes(0.25), 25);
  });
});
