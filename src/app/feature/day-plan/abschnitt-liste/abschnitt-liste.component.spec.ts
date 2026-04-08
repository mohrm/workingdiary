import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';

import { AbschnittListeComponent } from './abschnitt-liste.component';
import { PersistenceServiceService } from '../../../persistence-service.service';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';

describe('AbschnittListeComponent', () => {
  let component: AbschnittListeComponent;
  let fixture: ComponentFixture<AbschnittListeComponent>;
  let persistence: PersistenceServiceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbschnittListeComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AbschnittListeComponent);
    component = fixture.componentInstance;
    persistence = TestBed.inject(PersistenceServiceService);
    fixture.componentRef.setInput('day', '01.01.2024');
    fixture.componentRef.setInput('stempelEreignis', new EventEmitter<Section>());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads sections on init and on changes', () => {
    const sections = [new Section(new Time(9, 0), new Time(10, 0), 'Büro')];
    const loadSpy = jest.spyOn(persistence, 'loadSections').mockReturnValue(sections);

    component.ngOnInit();
    component.ngOnChanges({});

    expect(loadSpy).toHaveBeenCalledTimes(2);
    expect(component.abschnitte()).toEqual(sections);
  });

  it('appends emitted section and saves list', () => {
    const emitter = new EventEmitter<Section>();
    const existing = [new Section(new Time(8, 0), new Time(9, 0), 'A')];
    const added = new Section(new Time(9, 0), new Time(10, 0), 'B');
    const saveSpy = jest.spyOn(persistence, 'saveSections');
    jest.spyOn(persistence, 'loadSections').mockReturnValue(existing);

    fixture.componentRef.setInput('stempelEreignis', emitter);
    component.ngOnInit();
    emitter.emit(added);

    expect(component.abschnitte()).toEqual([...existing, added]);
    expect(saveSpy).toHaveBeenCalledWith('01.01.2024', [...existing, added]);
  });

  it('creates list when old sections are undefined', () => {
    const emitter = new EventEmitter<Section>();
    const added = new Section(new Time(9, 0), new Time(10, 0), 'B');
    jest.spyOn(persistence, 'loadSections').mockReturnValue(undefined);

    fixture.componentRef.setInput('stempelEreignis', emitter);
    component.ngOnInit();
    emitter.emit(added);

    expect(component.abschnitte()).toEqual([added]);
  });

  it('removes section by index', () => {
    const sections = [
      new Section(new Time(8, 0), new Time(9, 0), 'A'),
      new Section(new Time(9, 0), new Time(10, 0), 'B')
    ];
    const saveSpy = jest.spyOn(persistence, 'saveSections');
    component.abschnitte.set(sections);

    component.entferneAbschnitt(0);

    expect(component.abschnitte()).toEqual([sections[1]]);
    expect(saveSpy).toHaveBeenCalledWith('01.01.2024', [sections[1]]);
  });

  it('updates one section by index', () => {
    const sections = [
      new Section(new Time(8, 0), new Time(9, 0), 'A'),
      new Section(new Time(9, 0), new Time(10, 0), 'B')
    ];
    const replacement = new Section(new Time(8, 15), new Time(9, 15), 'Neu');
    component.abschnitte.set(sections);

    component.aendereAbschnitt(0, replacement);

    expect(component.abschnitte()).toEqual([replacement, sections[1]]);
  });
});
