import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StempeluhrComponent } from './stempeluhr.component';

describe('StempeluhrComponent', () => {
  let component: StempeluhrComponent;
  let fixture: ComponentFixture<StempeluhrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StempeluhrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StempeluhrComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('day', '01.01.2024');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
