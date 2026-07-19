import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { Time } from './Time';

describe('Time', () => {
  it('converts to minutes and industrial formats', () => {
    const time = new Time(1, 30);

    assert.strictEqual(time.inMinutes(), 90);
    assert.strictEqual(time.industrial(), 1.5);
    assert.strictEqual(time.industrialQuarterPrecision(), 1.5);
  });

  it('rounds to quarter-hour precision', () => {
    const time = new Time(1, 8);

    assert.strictEqual(time.industrialQuarterPrecision(), 1.25);
  });

  it('formats as HH:mm with leading zeros', () => {
    const time = new Time(9, 5);

    assert.strictEqual(time.formattedString(), '09:05');
  });

  it('serializes and deserializes with json helpers', () => {
    const time = new Time(13, 47);

    assert.deepEqual(time.toJSON(), { hour: 13, minute: 47 });
    assert.deepEqual(Time.fromJSON({ hour: 13, minute: 47 }), time);
  });

  it('creates current time with now()', () => {
    const fixedDate = new Date(2026, 3, 8, 14, 22);
    // biome-ignore lint/complexity/useArrowFunction: needs function for constructor-like mock
    mock.method(global, 'Date', function () {
      return fixedDate;
    });

    assert.deepEqual(Time.now(), new Time(14, 22));

    mock.restoreAll();
  });
});
