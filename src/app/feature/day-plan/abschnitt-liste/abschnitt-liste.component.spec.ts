import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbschnittListeComponent } from './abschnitt-liste.component';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';

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
    fixture.componentRef.setInput('day', '01.01.2024');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('includes unassigned sections in total duration without adding a separate category', () => {
    component.abschnitte.set([
      new Section(new Time(9, 0), new Time(10, 0), 'nicht zugeordnet'),
      new Section(new Time(10, 0), new Time(11, 30), 'Büro'),
      new Section(new Time(11, 30), new Time(12, 0), 'mobil')
    ]);

    expect(component.gesamtdauer().formattedString()).toBe('03:00');
    expect(component.bueroDauer().formattedString()).toBe('01:30');
    expect(component.mobilDauer().formattedString()).toBe('00:30');
  });

  it('renders combined industry time column for exact and rounded values', () => {
    component.abschnitte.set([
      new Section(new Time(9, 0), new Time(10, 30), 'Büro')
    ]);

    fixture.detectChanges();

    const headerCells = Array.from(
      fixture.nativeElement.querySelectorAll('thead th')
    ).map((cell: HTMLElement) => cell.textContent?.trim());
    const combinedCell = fixture.nativeElement.querySelector(
      '[data-testid="fullduration-industry-combined"]'
    ) as HTMLElement;

    expect(headerCells).toContain('Industriezeit (exakt/gerundet)');
    expect(combinedCell.textContent?.trim()).toContain(' / ');
  });
});
