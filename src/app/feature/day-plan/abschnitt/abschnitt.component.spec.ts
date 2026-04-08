import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbschnittComponent } from './abschnitt.component';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';

describe('AbschnittComponent', () => {
  let component: AbschnittComponent;
  let fixture: ComponentFixture<AbschnittComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbschnittComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AbschnittComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'section',
      new Section(new Time(9, 0), new Time(10, 0), 'Büro')
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('enters edit mode and pre-populates fields', () => {
    component.setEditable();

    expect(component.isEdit()).toBe(true);
    expect(component.startHour()).toBe(9);
    expect(component.startMinute()).toBe(0);
    expect(component.endHour()).toBe(10);
    expect(component.endMinute()).toBe(0);
    expect(component.location()).toBe('Büro');
  });

  it('resets edit mode on abort', () => {
    component.setEditable();

    component.abortEdit();

    expect(component.isEdit()).toBe(false);
  });

  it('saves edited section values', () => {
    component.setEditable();
    component.startHour.set(8);
    component.startMinute.set(30);
    component.endHour.set(11);
    component.endMinute.set(45);
    component.location.set('Homeoffice');

    component.finishEdit();

    expect(component.isEdit()).toBe(false);
    expect(component.section()).toEqual(new Section(new Time(8, 30), new Time(11, 45), 'Homeoffice'));
  });
});
