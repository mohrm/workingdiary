import { Injectable } from '@angular/core';
import { Time } from './model/Time';
import { Section } from './model/Section';

@Injectable({
  providedIn: 'root'
})
export class PersistenceServiceService {
  constructor() { }

  private initPlans(): any {
    const emptyPlans = {};
    localStorage.setItem("plans", JSON.stringify(emptyPlans))
    return emptyPlans;
  }

  private loadPlans(): any {
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
}
