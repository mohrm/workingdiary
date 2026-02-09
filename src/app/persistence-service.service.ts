import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Time } from './model/Time';
import { Section } from './model/Section';
import moment, { Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PersistenceServiceService {
  constructor() { }

  private sectionsChanged = new Subject<{ day: string; sections?: Section[] }>();
  readonly sectionsChanged$ = this.sectionsChanged.asObservable();

  private initPlans(): any {
    const emptyPlans = {};
    localStorage.setItem("plans", JSON.stringify(emptyPlans))
    return emptyPlans;
  }

  public loadPlans(): any {
    const sPlans = localStorage.getItem("plans");
    if (sPlans) {
      return JSON.parse(sPlans)
    } else {
      return this.initPlans();
    }
  }

  private initDay(plans: any, day: string): any {
    const emptyDayPlan = {};
    plans[day] = emptyDayPlan;
    localStorage.setItem("plans", JSON.stringify(plans))
    return emptyDayPlan;
  }

  private loadDayPlan(day: string): any {
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
      return sections.map((v:any,i:number,a:any[]) => Section.fromJSON(v));
    } else {
      return undefined;
    }
  }

  public previousDay(day: string): string {
    const plans = this.loadPlans();
    const daysBefore : Moment[] = new Array();
    const mDay = moment(day, 'DD.MM.YYYY')
    for (const pDay in plans) {
      const d = moment(pDay, 'DD.MM.YYYY')
      if (d.isBefore(mDay)) {
        daysBefore.push(d)
      }
    }
    if (daysBefore.length > 0) {
      return moment.max(daysBefore).toDate().toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit", year: "numeric"});
    } else {
      return day;
    }
  }


  public nextDay(day: string): string {
    const plans = this.loadPlans();
    const daysAfter : Moment[] = new Array();
    const mDay = moment(day, 'DD.MM.YYYY')
    for (const pDay in plans) {
      const d = moment(pDay, 'DD.MM.YYYY')
      if (d.isAfter(mDay)) {
        daysAfter.push(d)
      }
    }
    if (daysAfter.length > 0) {
      return moment.min(daysAfter).toDate().toLocaleDateString("de-DE", {day: "2-digit", month: "2-digit", year: "numeric"});
    } else {
      return day;
    }
  }
}
