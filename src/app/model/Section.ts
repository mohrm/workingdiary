import { Time } from './Time';
import { WorkLocation } from './WorkLocation';

export class Section {
  startTime: Time;
  endTime: Time;
  location: WorkLocation;

  constructor(startTime: Time, endTime: Time, location: WorkLocation) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location;
  }

  formattedString(): string {
    return this.startTime.formattedString() + " - " + this.endTime.formattedString();
  }

  durationInMinutes(): number {
    return this.endTime.inMinutes() - this.startTime.inMinutes();
  }

  toJSON(): any {
    return {startTime: this.startTime, endTime: this.endTime, loc: this.location}
  }

  static fromJSON(s: {startTime: any, endTime: any, l: WorkLocation|undefined}) {
    if (s.l) {
      return new Section(Time.fromJSON(s.startTime), Time.fromJSON(s.endTime), s.l);
    }

    return new Section(Time.fromJSON(s.startTime), Time.fromJSON(s.endTime), 'UNKNOWN');
  }
}
