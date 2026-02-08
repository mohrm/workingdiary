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
});
