export interface TimeJson {
  hour: number;
  minute: number;
}

export class Time {
  hour: number;
  minute: number;

  static now(): Time {
    const now = new Date();
    return new Time(now.getHours(), now.getMinutes());
  }
  constructor(hour: number, minute: number) {
    this.hour = hour;
    this.minute = minute;
  }

  inMinutes(): number {
    return 60 * this.hour + this.minute;
  }

  // "Industriezeit": duration expressed as a decimal hour value (7:30 -> 7.5)
  // instead of hours:minutes, as commonly used for time billing.
  industrial(): number {
    return this.inMinutes() / 60;
  }

  // Same as industrial(), rounded to the nearest quarter hour (0.25 steps),
  // since billing is typically done in 15-minute increments.
  industrialQuarterPrecision(): number {
    return Math.round(4 * this.industrial()) / 4;
  }

  formattedString(): string {
    return (
      this.hour.toString().padStart(2, '0') +
      ':' +
      this.minute.toString().padStart(2, '0')
    );
  }

  toJSON(): TimeJson {
    return { hour: this.hour, minute: this.minute };
  }

  static fromJSON(s: TimeJson): Time {
    return new Time(s.hour, s.minute);
  }
}
