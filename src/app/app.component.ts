import { Component, input, model, ModelSignal, OnInit, output, OutputEmitterRef } from '@angular/core';
import { Section } from './model/Section';
import { DayPlan } from './feature/day-plan/day-plan';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [DayPlan],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  day = model.required<string>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const newDay = params['day']
      if (newDay) {
        this.day.set(newDay)
      } else {
        this.day.set(this.today())
      }
    })
  }

  private today(): string {
    return new Date().toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit", year: "numeric"});
  }
}
