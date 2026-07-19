import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Section } from './Section';
import { Time } from './Time';

describe('Section', () => {
  it('defaults to nicht zugeordnet when no location is provided', () => {
    const section = new Section(new Time(9, 0), new Time(10, 0));

    assert.strictEqual(section.location, 'nicht zugeordnet');
  });

  it('formattedString returns the time range with location', () => {
    const section = new Section(new Time(9, 0), new Time(10, 30), 'Büro');

    assert.strictEqual(section.formattedString(), '09:00 - 10:30 (Büro)');
  });

  it('durationInMinutes returns the difference between end and start', () => {
    const section = new Section(new Time(10, 0), new Time(14, 15));

    assert.strictEqual(section.durationInMinutes(), 255);
  });

  it('toJSON serializes to SectionJson', () => {
    const section = new Section(new Time(8, 0), new Time(12, 0), 'mobil');

    assert.deepEqual(section.toJSON(), {
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

    assert.ok(section instanceof Section);
    assert.deepEqual(section.startTime, new Time(13, 0));
    assert.deepEqual(section.endTime, new Time(17, 30));
    assert.strictEqual(section.location, 'Büro');
  });
});
