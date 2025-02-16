import { Component, input, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';

class Time {
  hour: number;
  minute: number;

  constructor(hour: number, minute: number) {
    this.hour = hour;
    this.minute = minute;
  }

  inMinutes(): number {
    return 60 * this.hour + this.minute;
  }

  industrial(): number {
    return this.inMinutes() / 60;
  }

  industrialQuarterPrecision(): number {
    return Math.round(4 * this.industrial()) / 4;
  }

  formattedString(): string {
    return this.hour.toString().padStart(2, "0") + ":" + this.minute.toString().padStart(2, "0")
  }
}

class Section {
  start: Time;
  end: Time;

  constructor(start: Time, end: Time) {
    this.start = start;
    this.end = end;
  }
}
@Component({
  selector: 'day-plan',
  imports: [FormsModule],
  templateUrl: './day-plan.html',
  styleUrl: './day-plan.css'
})
export class DayPlan implements OnInit {
  day = input('01.01.2025');
  currentTime : Time
  nextStart? : Time
  sections = new Array<Section>();

  constructor() {
    let now = new Date();
    this.currentTime = new Time(now.getHours(), now.getMinutes());
    setInterval(() => {
      let now = new Date();
      this.currentTime = new Time(now.getHours(), now.getMinutes());
      let currentState = {
        nextStart: JSON.stringify(this.nextStart),
        sections: JSON.stringify(this.sections)
      }
      localStorage.setItem(this.day(), JSON.stringify(currentState));
    }, 1000)
  }

  ngOnInit() {
    const savedData = localStorage.getItem(this.day());
    if (savedData) {
      let o = JSON.parse(savedData);
      if (o["nextStart"]) {
        let ns = JSON.parse(o["nextStart"]);
        if (ns["hour"] && ns["minute"]) {
          this.nextStart = new Time(parseInt(ns["hour"]), parseInt(ns["minute"]));
        }
      }
      this.sections = new Array<Section>();
      for (let s of JSON.parse(o['sections'])) {
        const start = new Time(s.start.hour, s.start.minute);
        const end = new Time(s.end.hour, s.end.minute)
        this.sections.push(new Section(start, end));
      };
    } else {
      this.nextStart = undefined;
      this.sections = new Array<Section>();
    }
  }

  addTime(): void {
    if (!this.nextStart) {
      this.nextStart = this.currentTime;
    } else {
      this.sections.push(new Section(this.nextStart, this.currentTime));
      this.nextStart = undefined;
    }
  }

  removeSection(index: number): void {
    this.sections = this.sections.filter((v,i,a) => i !== index);
  }

  totalTime(): Time {
    let sumMinutes = 0;
    for (let section of this.sections) {
      let minuteOfStart: number = 60 * section.start.hour + section.start.minute;
      console.log(minuteOfStart);
      let minuteOfEnd: number = 60 * section.end.hour + section.end.minute;
      console.log(minuteOfEnd);
      sumMinutes += (section.end.inMinutes() - section.start.inMinutes());
    }

    let hours = Math.floor(sumMinutes / 60);
    let minutes = sumMinutes - 60 * hours;
    return new Time(hours, minutes);
  }

  formattedTimeSum(): string {
    return this.totalTime().formattedString();
  }
}
