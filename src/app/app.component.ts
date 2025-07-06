import { Component, computed, inject, input, model, ModelSignal, OnInit, output, OutputEmitterRef } from '@angular/core';
import { Section } from './model/Section';
import { DayPlan } from './feature/day-plan/day-plan';
import { ActivatedRoute, Params, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PersistenceServiceService } from './persistence-service.service';
import { VersionService } from './version.service';
import { DownloadPlansComponent } from './feature/download-plans/download-plans.component';

@Component({
  selector: 'app-root',
  imports: [DayPlan, RouterLink, DownloadPlansComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  day = model.required<string>();

  persistence = inject(PersistenceServiceService)
  version = inject(VersionService)


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

  versionInfo(): string {
    return this.version.getVersion()
  }

  commitTimestamp(): string {
    return this.version.commitTimestamp()
  }

  commitHash(): string {
    return this.version.commitHash()
  }

  urlOfLastCommit(): string {
    return this.version.urlOfLastCommit()
  }
}
