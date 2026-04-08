import { TestBed } from '@angular/core/testing';

import { PersistenceServiceService } from './persistence-service.service';
import { Section } from './model/Section';
import { Time } from './model/Time';

describe('PersistenceServiceService', () => {
  let service: PersistenceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersistenceServiceService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initializes plans storage when empty', () => {
    expect(localStorage.getItem('plans')).toBeNull();

    const plans = service.loadPlans();

    expect(plans).toEqual({});
    expect(localStorage.getItem('plans')).toBe('{}');
  });

  it('saves and loads start time', () => {
    const day = '01.01.2024';
    const start = new Time(9, 30);

    service.saveStartTime(day, start);

    expect(service.loadStartTime(day)).toEqual(start);
  });

  it('clears start time when undefined is saved', () => {
    const day = '01.01.2024';

    service.saveStartTime(day, new Time(8, 0));
    service.saveStartTime(day, undefined);

    expect(service.loadStartTime(day)).toBeUndefined();
  });

  it('saves and loads sections', () => {
    const day = '01.01.2024';
    const sections = [new Section(new Time(9, 0), new Time(10, 0), 'Büro')];

    service.saveSections(day, sections);

    expect(service.loadSections(day)).toEqual(sections);
  });

  it('returns undefined when no sections are available', () => {
    expect(service.loadSections('01.01.2024')).toBeUndefined();
  });

  it('emits section updates when saving sections', (done) => {
    const day = '01.01.2024';
    const sections = [new Section(new Time(9, 0), new Time(10, 0), 'Büro')];

    service.sectionsChanged$.subscribe(({ day: emittedDay, sections: emittedSections }) => {
      expect(emittedDay).toBe(day);
      expect(emittedSections).toEqual(sections);
      done();
    });

    service.saveSections(day, sections);
  });

  it('returns previous day if available, otherwise current day', () => {
    service.saveSections('01.01.2024', []);
    service.saveSections('03.01.2024', []);

    expect(service.previousDay('03.01.2024')).toBe('01.01.2024');
    expect(service.previousDay('01.01.2024')).toBe('01.01.2024');
  });

  it('returns next day if available, otherwise current day', () => {
    service.saveSections('01.01.2024', []);
    service.saveSections('03.01.2024', []);

    expect(service.nextDay('01.01.2024')).toBe('03.01.2024');
    expect(service.nextDay('03.01.2024')).toBe('03.01.2024');
  });
});
