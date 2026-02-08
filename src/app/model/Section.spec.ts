import { Section } from './Section';
import { Time } from './Time';

describe('Section', () => {
  it('defaults to nicht zugeordnet when no location is provided', () => {
    const section = new Section(new Time(9, 0), new Time(10, 0));

    expect(section.location).toBe('nicht zugeordnet');
  });
});
