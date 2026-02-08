import { Component, computed, EventEmitter, inject, input, model, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Section } from '../../../model/Section';
import { Time } from '../../../model/Time';
import { PersistenceServiceService } from '../../../persistence-service.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import { DecimalPipe } from '@angular/common';
import { AbschnittComponent } from '../abschnitt/abschnitt.component';

@Component({
  selector: 'app-abschnitt-liste',
  imports: [MatButtonModule, MatIconModule, DecimalPipe, MatListModule, AbschnittComponent],
  templateUrl: './abschnitt-liste.component.html',
  styleUrl: './abschnitt-liste.component.css'
})
export class AbschnittListeComponent implements OnInit, OnChanges {


  persistence = inject(PersistenceServiceService)
  stempelEreignis = input<EventEmitter<Section>>();
  day = input.required<string>();
  abschnitte = model<Section[]>();


  ngOnInit(): void {
    this.abschnitte.set(this.persistence.loadSections(this.day()))
    this.stempelEreignis()?.subscribe(neuerAbschnitt => {
      this.abschnitte.update(alteAbschnitte => {
        let neueAbschnitte;
        if (!alteAbschnitte) {
          neueAbschnitte = [neuerAbschnitt];
        } else {
          neueAbschnitte = [...alteAbschnitte, neuerAbschnitt];
        }
        return neueAbschnitte;
      })
      this.persistence.saveSections(this.day(), this.abschnitte())
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.abschnitte.set(this.persistence.loadSections(this.day()))
  }

  entferneAbschnitt(index: number): void {
    this.abschnitte.update(alteAbschnitte => alteAbschnitte?.filter((v,i,a) => i !== index));
    this.persistence.saveSections(this.day(), this.abschnitte())
  }

  aendereAbschnitt(index: number, newSection: Section) {
    this.abschnitte.update(alteAbschnitte => alteAbschnitte?.map((v,i,a) => {
      if (i == index) {
        return newSection;
      } else {
        return v;
      }
    }))
    this.persistence.saveSections(this.day(), this.abschnitte())
  }

  private sumMinutes(location?: string): number {
    const abschnitte = this.abschnitte();
    if (!abschnitte) {
      return 0;
    }
    return abschnitte
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
  })

  bueroDauer = computed<Time>(() => {
    return this.toTime(this.sumMinutes('Büro'));
  })

  mobilDauer = computed<Time>(() => {
    return this.toTime(this.sumMinutes('mobil'));
  })
}
