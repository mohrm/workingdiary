import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Time, TimeJson } from './model/Time';
import { Section, SectionJson } from './model/Section';

interface DayPlan {
  startTime?: TimeJson;
  sections?: SectionJson[];
}

@Injectable({
  providedIn: 'root'
})
export class PersistenceServiceService {
  private sectionsChanged = new Subject<{ day: string; sections?: Section[] }>();
  readonly sectionsChanged$ = this.sectionsChanged.asObservable();

  private initPlans(): Record<string, DayPlan> {
    const emptyPlans: Record<string, DayPlan> = {};
    localStorage.setItem("plans", JSON.stringify(emptyPlans))
    return emptyPlans;
  }

  public loadPlans(): Record<string, DayPlan> {
    const sPlans = localStorage.getItem("plans");
    if (sPlans) {
      return JSON.parse(sPlans) as Record<string, DayPlan>
    } else {
      return this.initPlans();
    }
  }

  private initDay(plans: Record<string, DayPlan>, day: string): DayPlan {
    const emptyDayPlan: DayPlan = {};
    plans[day] = emptyDayPlan;
    localStorage.setItem("plans", JSON.stringify(plans))
    return emptyDayPlan;
  }

  private loadDayPlan(day: string): Record<string, DayPlan> {
    const plans = this.loadPlans();
    const dayPlan = plans[day];
    if (!dayPlan) {
      this.initDay(plans, day);
    }
    return plans;
  }

  public saveStartTime(day: string, startTime?: Time) {
    const plans = this.loadDayPlan(day);
    if (startTime) {
      plans[day]['startTime'] = startTime;
    } else {
      plans[day]['startTime'] = undefined;
    }
    localStorage.setItem("plans", JSON.stringify(plans));
  }

  public loadStartTime(day: string): Time|undefined {
    const plans = this.loadDayPlan(day);
    const startTime = plans[day]['startTime'];
    if (startTime) {
      return new Time(startTime['hour'], startTime['minute'])
    } else {
      return undefined;
    }
  }

  public saveSections(day: string, sections?: Section[]) {
    const plans = this.loadDayPlan(day);
    plans[day]['sections'] = sections;
    localStorage.setItem("plans", JSON.stringify(plans));
    this.sectionsChanged.next({ day, sections });
  }

  public loadSections(day: string): Section[]|undefined {
    const plans = this.loadDayPlan(day);
    const sections = plans[day]['sections'];
    if (sections) {
      return sections.map(v => Section.fromJSON(v));
    } else {
      return undefined;
    }
  }

  public previousDay(day: string): string {
    const plans = this.loadPlans();
    const mDay = this.parseGermanDate(day)

    const daysBefore : Date[] = [];

    for (const pDay in plans) {
      const d = this.parseGermanDate(pDay)
      if (d < mDay) {
        daysBefore.push(d);
      }
    }
    if (daysBefore.length > 0) {
      const maxDate = new Date(Math.max(...daysBefore.map(d => d.getTime())))
      return this.formatGermanDate(maxDate)
    } else {
      return day;
    }
  }


  public nextDay(day: string): string {
    const plans = this.loadPlans();
    const mDay = this.parseGermanDate(day)
    const daysAfter : Date[] = [];
    for (const pDay in plans) {
      const d = this.parseGermanDate(pDay)
      if (d > mDay) {
        daysAfter.push(d)
      }
    }
    if (daysAfter.length > 0) {
      const minDate = new Date(Math.min(...daysAfter.map(d => d.getTime())));
      return this.formatGermanDate(minDate)
    } else {
      return day;
    }
  }

  private parseGermanDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatGermanDate(date: Date): string {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
}
}
