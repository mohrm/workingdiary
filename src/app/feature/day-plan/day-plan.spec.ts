import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayPlan } from './day-plan';
import { Section } from '../../model/Section';
import { Time } from '../../model/Time';

describe('DayPlanComponent', () => {
  let component: DayPlan;
  let fixture: ComponentFixture<DayPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayPlan]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DayPlan);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('day', '01.01.2024');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('forwards checkout events to stempel event emitter', () => {
    const emitSpy = jest.spyOn(component.stempelUhrEreignis, 'emit');
    const section = new Section(new Time(9, 0), new Time(10, 0), 'Büro');

    component.benutzerHatAusgestempelt(section);

    expect(emitSpy).toHaveBeenCalledWith(section);
  });

  it('forwards section change events', () => {
    const emitSpy = jest.spyOn(component.abschnitteAenderungsEreignis, 'emit');
    const sections = [new Section(new Time(9, 0), new Time(10, 0), 'Büro')];

    component.abschnitteGeaendert(sections);

    expect(emitSpy).toHaveBeenCalledWith(sections);
  });
});
