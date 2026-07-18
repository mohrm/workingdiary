import { persistence, SECTIONS_CHANGED } from './services/persistence';
import { Section } from './model/Section';
import { Time } from './model/Time';

describe('PersistenceService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes plans storage when empty', () => {
    expect(localStorage.getItem('plans')).toBeNull();

    const plans = persistence.loadPlans();

    expect(plans).toEqual({});
    expect(localStorage.getItem('plans')).toBe('{}');
  });

  it('saves and loads start time', () => {
    const day = '01.01.2024';
    const start = new Time(9, 30);

    persistence.saveStartTime(day, start);

    expect(persistence.loadStartTime(day)).toEqual(start);
  });

  it('clears start time when undefined is saved', () => {
    const day = '01.01.2024';

    persistence.saveStartTime(day, new Time(8, 0));
    persistence.saveStartTime(day, undefined);

    expect(persistence.loadStartTime(day)).toBeUndefined();
  });

  it('saves and loads sections', () => {
    const day = '01.01.2024';
    const sections = [new Section(new Time(9, 0), new Time(10, 0), 'Büro')];

    persistence.saveSections(day, sections);

    expect(persistence.loadSections(day)).toEqual(sections);
  });

  it('returns undefined when no sections are available', () => {
    expect(persistence.loadSections('01.01.2024')).toBeUndefined();
  });

  it('emits section updates when saving sections', (done) => {
    const day = '01.01.2024';
    const sections = [new Section(new Time(9, 0), new Time(10, 0), 'Büro')];

    window.addEventListener(SECTIONS_CHANGED, (e) => {
      const { day: emittedDay, sections: emittedSections } = (e as CustomEvent).detail;
      expect(emittedDay).toBe(day);
      expect(emittedSections).toEqual(sections);
      done();
    });

    persistence.saveSections(day, sections);
  });

  it('returns previous day if available, otherwise current day', () => {
    persistence.saveSections('01.01.2024', []);
    persistence.saveSections('03.01.2024', []);

    expect(persistence.previousDay('03.01.2024')).toBe('01.01.2024');
    expect(persistence.previousDay('01.01.2024')).toBe('01.01.2024');
  });

  it('returns next day if available, otherwise current day', () => {
    persistence.saveSections('01.01.2024', []);
    persistence.saveSections('03.01.2024', []);

    expect(persistence.nextDay('01.01.2024')).toBe('03.01.2024');
    expect(persistence.nextDay('03.01.2024')).toBe('03.01.2024');
  });
});
