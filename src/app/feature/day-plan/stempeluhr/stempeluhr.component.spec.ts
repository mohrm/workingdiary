import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';

import { StempeluhrComponent } from './stempeluhr.component';
import { PersistenceServiceService } from '../../../persistence-service.service';
import { Time } from '../../../model/Time';
import { Section } from '../../../model/Section';

describe('StempeluhrComponent', () => {
  let component: StempeluhrComponent;
  let fixture: ComponentFixture<StempeluhrComponent>;
  let persistence: PersistenceServiceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StempeluhrComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StempeluhrComponent);
    component = fixture.componentInstance;
    persistence = TestBed.inject(PersistenceServiceService);
    fixture.componentRef.setInput('day', '01.01.2024');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads start time on init and on changes', () => {
    const loaded = new Time(9, 15);
    const loadSpy = jest.spyOn(persistence, 'loadStartTime').mockReturnValue(loaded);

    component.ngOnInit();
    component.ngOnChanges({});

    expect(loadSpy).toHaveBeenCalledTimes(2);
    expect(component.startTime()).toEqual(loaded);
  });

  it('enables edit mode with current start time', () => {
    component.startTime.set(new Time(7, 25));

    component.setEditable();

    expect(component.isEdit()).toBe(true);
    expect(component.hour()).toBe(7);
    expect(component.minute()).toBe(25);
  });

  it('aborts edit mode', () => {
    component.isEdit.set(true);

    component.abortEdit();

    expect(component.isEdit()).toBe(false);
  });

  it('persists manually edited time', () => {
    component.hour.set(11);
    component.minute.set(55);
    component.isEdit.set(true);

    component.finishEdit();

    expect(component.startTime()).toEqual(new Time(11, 55));
    expect(component.isEdit()).toBe(false);
  });

  it('stamps in once and saves start time', () => {
    const now = new Time(8, 0);
    const nowSpy = jest.spyOn(Time, 'now').mockReturnValue(now);
    const saveSpy = jest.spyOn(persistence, 'saveStartTime');

    component.startTime.set(undefined);
    component.einstempeln();

    expect(component.startTime()).toEqual(now);
    expect(saveSpy).toHaveBeenCalledWith('01.01.2024', now);
    nowSpy.mockRestore();
  });

  it('throws when stamping in twice', () => {
    component.startTime.set(new Time(8, 0));

    expect(() => component.einstempeln()).toThrow('Kann nicht einstempeln');
  });

  it('stamps out, emits section and clears start time', () => {
    const now = new Time(12, 5);
    const nowSpy = jest.spyOn(Time, 'now').mockReturnValue(now);
    const emitSpy = jest.spyOn(component.stempelEreignis, 'emit');
    const saveSpy = jest.spyOn(persistence, 'saveStartTime');

    component.startTime.set(new Time(9, 0));
    component.ausstempeln();

    expect(emitSpy).toHaveBeenCalledWith(new Section(new Time(9, 0), now));
    expect(component.startTime()).toBeUndefined();
    expect(saveSpy).toHaveBeenCalledWith('01.01.2024', undefined);
    nowSpy.mockRestore();
  });

  it('throws when stamping out without start time', () => {
    component.startTime.set(undefined);

    expect(() => component.ausstempeln()).toThrow('Kann nicht ausstempeln');
  });
});
