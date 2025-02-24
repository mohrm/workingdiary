export class Time {
  hour: number;
  minute: number;

  static now(): Time {
    let now = new Date();
    return new Time(now.getHours(), now.getMinutes());
  }
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
    return this.hour.toString().padStart(2, "0") + ":" + this.minute.toString().padStart(2, "0");
  }

  toJSON(): any {
    return {hour: this.hour, minute: this.minute};
  }

  static fromJSON(s: {hour: number, minute: number}): Time {
    return new Time(s.hour, s.minute);
  }
}
