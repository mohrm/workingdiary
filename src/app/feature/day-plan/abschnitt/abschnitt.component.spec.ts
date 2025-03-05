import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbschnittComponent } from './abschnitt.component';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
