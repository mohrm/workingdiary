import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayPlan } from './day-plan';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
