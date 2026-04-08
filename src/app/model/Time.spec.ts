import { Time } from './Time';

describe('Time', () => {
  it('converts to minutes and industrial formats', () => {
    const time = new Time(1, 30);

    expect(time.inMinutes()).toBe(90);
    expect(time.industrial()).toBe(1.5);
    expect(time.industrialQuarterPrecision()).toBe(1.5);
  });

  it('rounds to quarter-hour precision', () => {
    const time = new Time(1, 8);

    expect(time.industrialQuarterPrecision()).toBe(1.25);
  });

  it('formats as HH:mm with leading zeros', () => {
    const time = new Time(9, 5);

    expect(time.formattedString()).toBe('09:05');
  });

  it('serializes and deserializes with json helpers', () => {
    const time = new Time(13, 47);

    expect(time.toJSON()).toEqual({ hour: 13, minute: 47 });
    expect(Time.fromJSON({ hour: 13, minute: 47 })).toEqual(time);
  });

  it('creates current time with now()', () => {
    const fixedDate = new Date(2026, 3, 8, 14, 22);
    const dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as unknown as string);

    expect(Time.now()).toEqual(new Time(14, 22));

    dateSpy.mockRestore();
  });
});
