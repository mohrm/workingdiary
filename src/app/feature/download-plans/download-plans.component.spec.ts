import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadPlansComponent } from './download-plans.component';

describe('DownloadPlansComponent', () => {
  let component: DownloadPlansComponent;
  let fixture: ComponentFixture<DownloadPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
