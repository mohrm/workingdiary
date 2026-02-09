import { TestBed } from '@angular/core/testing';

import { PersistenceServiceService } from './persistence-service.service';
import { Section } from './model/Section';
import { Time } from './model/Time';

describe('PersistenceServiceService', () => {
  let service: PersistenceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersistenceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
});
