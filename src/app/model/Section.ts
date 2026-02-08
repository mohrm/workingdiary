import { Time } from './Time';

export class Section {
  startTime: Time;
  endTime: Time;
  location: string;

  constructor(startTime: Time, endTime: Time, location: string = '') {
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location;
  }

  formattedString(): string {
    const timeRange = this.startTime.formattedString() + " - " + this.endTime.formattedString();
    if (this.location) {
      return `${timeRange} (${this.location})`;
    }
    return timeRange;
  }

  durationInMinutes(): number {
    return this.endTime.inMinutes() - this.startTime.inMinutes();
  }

  toJSON(): any {
    return {startTime: this.startTime, endTime: this.endTime, location: this.location}
  }

  static fromJSON(s: {startTime: any, endTime: any, location?: string}): Section {
    return new Section(Time.fromJSON(s.startTime), Time.fromJSON(s.endTime), s.location ?? '');
  }
}
