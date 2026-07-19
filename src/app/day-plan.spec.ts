import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { installFakeDocument, resetFakeDocument } from './test-utils';
import { createDayPlan } from './feature/day-plan/day-plan';

describe('DayPlan', () => {
  beforeEach(() => {
    localStorage.clear();
    installFakeDocument();
  });

  it('updates the title when navigating to a different day', () => {
    const plan = createDayPlan('01.01.2024');

    const title = plan.element.querySelector('[data-testid="dayplan-title"]');
    assert.ok(title?.textContent?.includes('01.01.2024'));

    plan.update('02.01.2024');

    assert.ok(title?.textContent?.includes('02.01.2024'));
  });
});
