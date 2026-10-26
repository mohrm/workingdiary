import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Section } from './Section';
import {
  SECTION_VALIDATION_ERROR_MESSAGES,
  validateSection,
} from './section-validation';
import { Time } from './Time';

function section(startH: number, startM: number, endH: number, endM: number) {
  return new Section(new Time(startH, startM), new Time(endH, endM));
}

describe('validateSection', () => {
  it('returns end-before-start error when end is before start', () => {
    const result = validateSection(section(10, 0, 9, 0), []);
    assert.strictEqual(result?.type, 'end-before-start');
    assert.strictEqual(
      result?.message,
      SECTION_VALIDATION_ERROR_MESSAGES['end-before-start'],
    );
  });

  it('accepts end equal to start', () => {
    const result = validateSection(section(9, 30, 9, 30), []);
    assert.strictEqual(result, undefined);
  });

  it('accepts end after start', () => {
    const result = validateSection(section(8, 0, 17, 0), []);
    assert.strictEqual(result, undefined);
  });

  it('returns overlap error for a real overlap', () => {
    const others = [section(9, 0, 10, 0)];
    const result = validateSection(section(9, 30, 10, 30), others);
    assert.strictEqual(result?.type, 'overlap');
    assert.strictEqual(
      result?.message,
      SECTION_VALIDATION_ERROR_MESSAGES.overlap,
    );
  });

  it('detects overlap when the new section contains another one', () => {
    const others = [section(9, 30, 10, 30)];
    const result = validateSection(section(9, 0, 11, 0), others);
    assert.strictEqual(result?.type, 'overlap');
  });

  it('detects overlap when the new section is contained in another one', () => {
    const others = [section(9, 0, 11, 0)];
    const result = validateSection(section(9, 30, 10, 30), others);
    assert.strictEqual(result?.type, 'overlap');
  });

  it('accepts touching times (end equals start of another)', () => {
    const others = [section(9, 0, 10, 0)];
    const result = validateSection(section(10, 0, 11, 0), others);
    assert.strictEqual(result, undefined);
  });

  it('accepts touching times (start equals end of another)', () => {
    const others = [section(9, 0, 10, 0)];
    const result = validateSection(section(8, 0, 9, 0), others);
    assert.strictEqual(result, undefined);
  });

  it('ignores non-overlapping sections regardless of order', () => {
    const others = [section(12, 0, 13, 0), section(6, 0, 8, 0)];
    const result = validateSection(section(8, 30, 11, 30), others);
    assert.strictEqual(result, undefined);
  });

  it('checks multiple others and reports the first overlap', () => {
    const others = [section(6, 0, 8, 0), section(10, 0, 11, 0)];
    const result = validateSection(section(10, 30, 12, 0), others);
    assert.strictEqual(result?.type, 'overlap');
  });
});
