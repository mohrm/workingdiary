import { Component, input, model, ModelSignal, output, OutputEmitterRef } from '@angular/core';
import { Section } from './model/Section';
import { DayPlan } from './feature/day-plan/day-plan';

@Component({
  selector: 'app-root',
  imports: [DayPlan],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  today(): string {
    return new Date().toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit", year: "numeric"});
  }
}
