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

// Industrial time is entered in decimal hours ("Industrieminuten": 100
// units per hour, e.g. 7,5 for seven and a half hours).
export function hoursToIndustrialMinutes(hours: number): number {
  return Math.round(100 * hours);
}

// A day's sections are stored as calendar minutes; convert them to
// industrial minutes for the distribution screen.
export function calendarMinutesToIndustrial(minutes: number): number {
  return Math.round((minutes * 100) / 60);
}

export function industrialMinutesToHours(minutes: number): number {
  return minutes / 100;
}

export function formatIndustrialMinutes(minutes: number): string {
  const value = industrialMinutesToHours(minutes);
  return (Math.round(value * 100) / 100).toFixed(2).replace('.', ',');
}
