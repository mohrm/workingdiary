import { Section } from './Section';
import { Time } from './Time';

describe('Section', () => {
  it('defaults to nicht zugeordnet when no location is provided', () => {
    const section = new Section(new Time(9, 0), new Time(10, 0));

    expect(section.location).toBe('nicht zugeordnet');
  });

  it('formattedString returns the time range with location', () => {
    const section = new Section(new Time(9, 0), new Time(10, 30), 'Büro');

    expect(section.formattedString()).toBe('09:00 - 10:30 (Büro)');
  });

  it('durationInMinutes returns the difference between end and start', () => {
    const section = new Section(new Time(10, 0), new Time(14, 15));

    expect(section.durationInMinutes()).toBe(255);
  });

  it('toJSON serializes to SectionJson', () => {
    const section = new Section(new Time(8, 0), new Time(12, 0), 'mobil');

    expect(section.toJSON()).toEqual({
      startTime: { hour: 8, minute: 0 },
      endTime: { hour: 12, minute: 0 },
      location: 'mobil',
    });
  });

  it('fromJSON restores a Section from SectionJson', () => {
    const section = Section.fromJSON({
      startTime: { hour: 13, minute: 0 },
      endTime: { hour: 17, minute: 30 },
      location: 'Büro',
    });

    expect(section).toBeInstanceOf(Section);
    expect(section.startTime).toEqual(new Time(13, 0));
    expect(section.endTime).toEqual(new Time(17, 30));
    expect(section.location).toBe('Büro');
  });
});
