import { Time, TimeJson } from './Time';

export interface SectionJson {
  startTime: TimeJson;
  endTime: TimeJson;
  location?: string;
}

export class Section {
  startTime: Time;
  endTime: Time;
  location: string;

  constructor(startTime: Time, endTime: Time, location = 'nicht zugeordnet') {
    this.startTime = startTime;
    this.endTime = endTime;
    this.location = location;
  }

  formattedString(): string {
    const timeRange = this.startTime.formattedString() + " - " + this.endTime.formattedString();
    return `${timeRange} (${this.location})`;
  }

  durationInMinutes(): number {
    return this.endTime.inMinutes() - this.startTime.inMinutes();
  }

  toJSON(): SectionJson {
    return {startTime: this.startTime, endTime: this.endTime, location: this.location}
  }

  static fromJSON(s: SectionJson): Section {
    return new Section(Time.fromJSON(s.startTime), Time.fromJSON(s.endTime), s.location ?? 'nicht zugeordnet');
  }
}
