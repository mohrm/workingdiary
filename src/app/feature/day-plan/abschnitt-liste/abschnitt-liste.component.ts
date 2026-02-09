import { Component, EventEmitter, inject, input, model, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Section } from '../../../model/Section';
import { PersistenceServiceService } from '../../../persistence-service.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import { AbschnittComponent } from '../abschnitt/abschnitt.component';

@Component({
  selector: 'app-abschnitt-liste',
  imports: [MatButtonModule, MatIconModule, MatListModule, AbschnittComponent],
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

}
