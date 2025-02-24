import { Component, input, WritableSignal, signal, OnInit, computed, EventEmitter} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Time } from '../../model/Time';
import { Section } from '../../model/Section';
import { StempeluhrComponent } from './stempeluhr/stempeluhr.component';
import { AbschnittListeComponent } from "./abschnitt-liste/abschnitt-liste.component";

@Component({
  selector: 'day-plan',
  imports: [StempeluhrComponent, AbschnittListeComponent],
  templateUrl: './day-plan.html',
  styleUrl: './day-plan.css'
})
export class DayPlan implements OnInit {

  day = input.required<string>();

  ngOnInit() {
    
  }

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
