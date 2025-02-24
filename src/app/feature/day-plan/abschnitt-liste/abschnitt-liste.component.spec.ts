import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbschnittListeComponent } from './abschnitt-liste.component';

describe('AbschnittListeComponent', () => {
  let component: AbschnittListeComponent;
  let fixture: ComponentFixture<AbschnittListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbschnittListeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbschnittListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
