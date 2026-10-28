export interface ActivityJson {
  name: string;
  minutes: number;
}

export class Activity {
  name: string;
  minutes: number;

  constructor(name: string, minutes: number) {
    this.name = name;
    this.minutes = minutes;
  }

  toJSON(): ActivityJson {
    return { name: this.name, minutes: this.minutes };
  }

  static fromJSON(a: ActivityJson): Activity {
    return new Activity(a.name, a.minutes);
  }
}

// "Industriezeit" is entered as decimal hours (7,75 for 7 h 45 min); it is
// stored internally as industrial minutes (100 per hour) to avoid float
// artifacts.
export function hoursToIndustrialMinutes(hours: number): number {
  return Math.round(100 * hours);
}

// A day's sections are stored as calendar minutes; convert them to
// industrial minutes for the distribution screen.
export function calendarMinutesToIndustrial(minutes: number): number {
  return Math.round((minutes * 100) / 60);
}
