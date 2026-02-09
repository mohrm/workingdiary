import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, OnChanges, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';
import { PersistenceServiceService } from '../../../persistence-service.service';

@Component({
  selector: 'app-abschnitt-summe',
  imports: [DecimalPipe],
  templateUrl: './abschnitt-summe.component.html',
  styleUrl: './abschnitt-summe.component.css'
})
export class AbschnittSummeComponent implements OnInit, OnChanges, OnDestroy {
  day = input.required<string>();
  private persistence = inject(PersistenceServiceService);
  private destroy$ = new Subject<void>();

  abschnitte = signal<Section[]>([]);

  ngOnInit(): void {
    this.loadSections();
    this.persistence.sectionsChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ day, sections }) => {
        if (day === this.day()) {
          this.abschnitte.set(sections ?? []);
        }
      });
  }

  ngOnChanges(): void {
    this.loadSections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSections(): void {
    this.abschnitte.set(this.persistence.loadSections(this.day()) ?? []);
  }

  private sumMinutes(location?: string): number {
    return this.abschnitte()
      .filter(section => !location || section.location === location)
      .map(section => section.durationInMinutes())
      .reduce((prev, cur) => prev + cur, 0);
  }

  private toTime(minutes: number): Time {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes - 60 * hours;
    return new Time(hours, remainingMinutes);
  }

  gesamtdauer = computed<Time>(() => {
    return this.toTime(this.sumMinutes());
  });

  bueroDauer = computed<Time>(() => {
    return this.toTime(this.sumMinutes('Büro'));
  });

  mobilDauer = computed<Time>(() => {
    return this.toTime(this.sumMinutes('mobil'));
  });
}
