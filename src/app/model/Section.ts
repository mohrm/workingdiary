import { Time } from './Time';

export class Section {
  startTime: Time;
  endTime: Time;

  constructor(startTime: Time, endTime: Time) {
    this.startTime = startTime;
    this.endTime = endTime;
  }

  formattedString(): string {
    return this.startTime.formattedString() + " - " + this.endTime.formattedString();
  }

  durationInMinutes(): number {
    return this.endTime.inMinutes() - this.startTime.inMinutes();
  }

  toJSON(): any {
    return {startTime: this.startTime, endTime: this.endTime}
  }

  static fromJSON(s: {startTime: any, endTime: any}): Section {
    return new Section(Time.fromJSON(s.startTime), Time.fromJSON(s.endTime));
  }
}
