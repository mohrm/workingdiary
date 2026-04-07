import { Component, EventEmitter, input } from '@angular/core';
import { Section } from '../../model/Section';
import { StempeluhrComponent } from './stempeluhr/stempeluhr.component';
import { AbschnittListeComponent } from "./abschnitt-liste/abschnitt-liste.component";

@Component({
  selector: 'app-day-plan',
  imports: [StempeluhrComponent, AbschnittListeComponent],
  templateUrl: './day-plan.html',
  styleUrl: './day-plan.css'
})
export class DayPlan {

  day = input.required<string>();

  stempelUhrEreignis : EventEmitter<Section>
  abschnitteAenderungsEreignis : EventEmitter<Section[]>

  constructor() {
    this.stempelUhrEreignis = new EventEmitter();
    this.abschnitteAenderungsEreignis = new EventEmitter();
  }

  benutzerHatAusgestempelt($event: Section) {
    this.stempelUhrEreignis.emit($event)
  }

  abschnitteGeaendert($event?: Section[]) {
    this.abschnitteAenderungsEreignis.emit($event)
  }
}
