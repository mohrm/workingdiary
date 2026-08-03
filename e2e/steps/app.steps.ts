import { expect, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { hasElementWithText, navigateTo } from '../page-objects/app.po';

const { Given, When, Then } = createBdd();

interface ControlPositions {
  time: { x: number; y: number } | null;
  location: { x: number; y: number } | null;
  delete: { x: number; y: number } | null;
}

const rememberedPositions = new WeakMap<Page, ControlPositions>();

async function readControlPositions(
  page: Page,
  sectionIndex: string,
): Promise<ControlPositions> {
  const section = page.getByTestId(`section-${sectionIndex}`);
  await section.waitFor();
  const boxOf = async (selector: string) => {
    const box = await section.locator(selector).first().boundingBox();
    return box ? { x: box.x, y: box.y } : null;
  };
  return {
    time: await boxOf('[data-start-hour]'),
    location: await boxOf('[data-location]'),
    delete: await boxOf('[data-action="delete"]'),
  };
}

Given('I open the home page', async ({ page: _page }) => {});

Then('I see {string} on the page', async ({ page: _page }, _theString) => {});

Given(
  "today's date is {string} and the current time is {string}",
  async ({ page }, day: string, time: string) => {
    await page.clock.setFixedTime(`${day}T${time}`);
  },
);

Given('the viewport is mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
});

When('I open the day plan for today', async ({ page }) => {
  await navigateTo(page, '/');
});

Then(
  'I see {string} on the heading',
  async ({ page }, expectedHeadingText: string) => {
    await hasElementWithText(page, 'dayplan-title', expectedHeadingText);
  },
);

When('I log in', async ({ page }) => {
  // Step: And I log in
  // From: features/app.feature:11:5
  await page.getByTestId('log-button').click();
});

Then('I see that the login time is {string}', async ({ page }, arg: string) => {
  await hasElementWithText(page, 'login-time', arg);
  // Step: Then I see that the login time is "08:00"
  // From: features/app.feature:12:5
});

Then(
  'the caption of the log button is {string}',
  async ({ page }, arg: string) => {
    // Step: And the caption of the log button is "Ausstempeln"
    // From: features/app.feature:13:5
    await hasElementWithText(page, 'log-button', arg);
  },
);

Given(
  'time moves forward to {string} at {string}',
  async ({ page }, day: string, time: string) => {
    // Step: And time moves forward to "2025-02-17" at "12:00:00"
    // From: features/app.feature:21:5
    await page.clock.setFixedTime(`${day}T${time}`);
  },
);

When('I log out', async ({ page }) => {
  // Step: When I log out
  // From: features/app.feature:21:7
  await page.getByTestId('log-button').click();
});

Then(
  'I see that section {string} has start time {string} and end time {string}',
  async ({ page }, sectionIndex: string, start: string, end: string) => {
    // Step: Then I see that section "0" has start time "08:00" and end time "09:00"
    // From: features/app.feature:27:5
    const sec = page.getByTestId(`section-${sectionIndex}`);
    await sec.waitFor();
    expect(sec).toContainText(`${start} - ${end}`);
  },
);

When(
  'I open the editor for section {string}',
  async ({ page }, sectionIndex: string) => {
    const section = page.getByTestId(`section-${sectionIndex}`);
    await section.waitFor();
    const editIcon = section.locator('[data-action="edit"]').first();
    await editIcon.click();
  },
);

When('I delete section {string}', async ({ page }, sectionIndex: string) => {
  const section = page.getByTestId(`section-${sectionIndex}`);
  await section.waitFor();
  const deleteIcon = section.locator('[data-action="delete"]').first();
  await deleteIcon.click();
});

Then(
  'section {string} is not being edited',
  async ({ page }, sectionIndex: string) => {
    const section = page.getByTestId(`section-${sectionIndex}`);
    await section.waitFor();
    await expect(section.locator('.abschnitt-edit')).toHaveCount(0);
  },
);

Then('the section editor inputs are fully visible', async ({ page }) => {
  const editor = page.locator('.abschnitt-edit');
  await editor.waitFor();

  const inputs = editor.locator('input[type="number"]');
  const select = editor.locator('select');
  const viewport = page.viewportSize();
  if (!viewport) {
    throw new Error('Viewport size is not set.');
  }

  const elements = [inputs.nth(0), inputs.nth(1), select];
  for (const element of elements) {
    await element.scrollIntoViewIfNeeded();
    const box = await element.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(24);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
  }
});

Given(
  "I remember the position of section {string}'s time, location and delete controls",
  async ({ page }, sectionIndex: string) => {
    rememberedPositions.set(
      page,
      await readControlPositions(page, sectionIndex),
    );
  },
);

Then(
  "section {string}'s time, location and delete controls have not moved",
  async ({ page }, sectionIndex: string) => {
    const before = rememberedPositions.get(page);
    if (!before) {
      throw new Error(
        'No remembered position — call the "I remember the position of..." step first.',
      );
    }
    const after = await readControlPositions(page, sectionIndex);

    for (const control of ['time', 'location', 'delete'] as const) {
      expect(before[control], `${control} before`).not.toBeNull();
      expect(after[control], `${control} after`).not.toBeNull();
      expect(after[control]!.x, `${control} x`).toBeCloseTo(
        before[control]!.x,
        0,
      );
      expect(after[control]!.y, `${control} y`).toBeCloseTo(
        before[control]!.y,
        0,
      );
    }
  },
);

Then(
  "the section editor's action icons are 24 by 24 pixels",
  async ({ page }) => {
    const editor = page.locator('.abschnitt-edit');
    await editor.waitFor();

    const icons = editor.locator('.abschnitt-icon-zone svg');
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await icons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBe(24);
      expect(box!.height).toBe(24);
    }
  },
);

Then(
  'the location select shows its full label without truncation',
  async ({ page }) => {
    const select = page.locator('.abschnitt-edit select[data-location]');
    await select.waitFor();

    const { clientWidth, scrollWidth } = await select.evaluate((el) => ({
      clientWidth: (el as HTMLSelectElement).clientWidth,
      scrollWidth: (el as HTMLSelectElement).scrollWidth,
    }));

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  },
);

Then(
  'the section editor does not overflow the viewport horizontally',
  async ({ page }) => {
    const editor = page.locator('.abschnitt-edit');
    await editor.waitFor();

    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  },
);
