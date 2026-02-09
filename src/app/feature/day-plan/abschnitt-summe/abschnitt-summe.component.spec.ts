import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AbschnittSummeComponent } from './abschnitt-summe.component';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';
import { PersistenceServiceService } from '../../../persistence-service.service';

class MockPersistenceService {
  private sections: Section[] = [];
  private changes = new Subject<{ day: string; sections?: Section[] }>();
  readonly sectionsChanged$ = this.changes.asObservable();

  loadSections(_day: string): Section[] {
    return this.sections;
  }

  emitChange(day: string, sections: Section[]) {
    this.sections = sections;
    this.changes.next({ day, sections });
  }
}

describe('AbschnittSummeComponent', () => {
  let component: AbschnittSummeComponent;
  let fixture: ComponentFixture<AbschnittSummeComponent>;
  let persistence: MockPersistenceService;

  beforeEach(async () => {
    persistence = new MockPersistenceService();

    await TestBed.configureTestingModule({
      imports: [AbschnittSummeComponent],
      providers: [
        {
          provide: PersistenceServiceService,
          useValue: persistence
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AbschnittSummeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('day', '01.01.2024');
    fixture.detectChanges();
  });

  it('includes unassigned sections in total duration without adding a separate category', () => {
    persistence.emitChange('01.01.2024', [
      new Section(new Time(9, 0), new Time(10, 0), 'nicht zugeordnet'),
      new Section(new Time(10, 0), new Time(11, 30), 'Büro'),
      new Section(new Time(11, 30), new Time(12, 0), 'mobil')
    ]);

    fixture.detectChanges();

    expect(component.gesamtdauer().formattedString()).toBe('03:00');
    expect(component.bueroDauer().formattedString()).toBe('01:30');
    expect(component.mobilDauer().formattedString()).toBe('00:30');
  });

  it('renders combined industry time column for exact and rounded values', () => {
    persistence.emitChange('01.01.2024', [
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
