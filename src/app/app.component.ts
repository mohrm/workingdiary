import { Component, computed, inject, input, model, ModelSignal, OnInit, output, OutputEmitterRef } from '@angular/core';
import { Section } from './model/Section';
import { DayPlan } from './feature/day-plan/day-plan';
import { ActivatedRoute, Params, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PersistenceServiceService } from './persistence-service.service';

@Component({
  selector: 'app-root',
  imports: [DayPlan, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  day = model.required<string>();

  persistence = inject(PersistenceServiceService)

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

  previousDay = computed<Params>(() => {
    return {"day": this.persistence.previousDay(this.day())};
  })


  nextDay = computed<Params>(() => {
    return {"day": this.persistence.nextDay(this.day())};
  })

  private today(): string {
    return new Date().toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit", year: "numeric"});
  }
}
