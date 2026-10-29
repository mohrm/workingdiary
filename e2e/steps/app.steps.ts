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
const rememberedBoxes = new WeakMap<
  Page,
  Record<string, { x: number; y: number }>
>();

// Positions are recorded relative to the document, not the viewport, by
// adding the current scroll offset: navigating via the "Zurück"/"Vor" links
// (which sit below the fold) makes Playwright auto-scroll them into view
// before clicking, which would otherwise look like every element above them
// had shifted, even though nothing in the layout actually moved.
async function readNamedBoxes(
  page: Page,
  selectors: Record<string, string>,
): Promise<Record<string, { x: number; y: number }>> {
  const scroll = await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
  }));
  const result: Record<string, { x: number; y: number }> = {};
  for (const [name, selector] of Object.entries(selectors)) {
    const box = await page.locator(selector).first().boundingBox();
    if (!box) {
      throw new Error(`Could not find element for "${name}" (${selector}).`);
    }
    result[name] = { x: box.x + scroll.x, y: box.y + scroll.y };
  }
  return result;
}

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
    await expect(sec).toContainText(`${start} - ${end}`);
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
    expect(box!.height).toBeGreaterThanOrEqual(24);
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

Then(
  'I see the column headers {string}, {string} and {string} above the section list',
  async ({ page }, start: string, ende: string, arbeitsort: string) => {
    const header = page.locator('.abschnitt-liste__header');
    await header.waitFor();
    await expect(header).toContainText(start);
    await expect(header).toContainText(ende);
    await expect(header).toContainText(arbeitsort);
  },
);

async function textRect(
  locator: ReturnType<Page['locator']>,
): Promise<{ left: number; right: number }> {
  return locator.first().evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rect = range.getBoundingClientRect();
    return { left: rect.left, right: rect.right };
  });
}

Then(
  "the column headers are left-aligned with section {string}'s values",
  async ({ page }, sectionIndex: string) => {
    const header = page.locator('.abschnitt-liste__header');
    const labelCells = header.locator(
      '.abschnitt-time-cell:not(.abschnitt-liste__header-filler)',
    );
    const section = page.getByTestId(`section-${sectionIndex}`);
    await section.waitFor();

    const startHeaderBox = await labelCells.nth(0).boundingBox();
    const endeHeaderBox = await labelCells.nth(1).boundingBox();
    const arbeitsortHeaderBox = await header
      .locator('.abschnitt-liste__header-location')
      .boundingBox();
    const startValueBox = await section
      .locator('[data-start-hour]')
      .boundingBox();
    const endeValueBox = await section.locator('[data-end-hour]').boundingBox();
    const arbeitsortValueBox = await section
      .locator('[data-location]')
      .boundingBox();

    for (const [headerBox, valueBox] of [
      [startHeaderBox, startValueBox],
      [endeHeaderBox, endeValueBox],
      [arbeitsortHeaderBox, arbeitsortValueBox],
    ] as const) {
      expect(headerBox).not.toBeNull();
      expect(valueBox).not.toBeNull();
      expect(headerBox!.x).toBeCloseTo(valueBox!.x, 0);
    }

    // The cell boxes above are fixed-width regardless of text-align, so
    // matching box positions alone doesn't prove the *glyphs* line up (see
    // e.g. https://github.com/mohrm/workingdiary/pull/552, which right-
    // aligned the hour digits inside an unchanged box and broke this
    // visually without moving any box). Compare rendered text position too.
    for (const [headerCell, valueSelector] of [
      [labelCells.nth(0), '[data-start-hour]'],
      [labelCells.nth(1), '[data-end-hour]'],
    ] as const) {
      const headerTextRect = await textRect(headerCell);
      const valueTextRect = await textRect(section.locator(valueSelector));
      expect(headerTextRect.left).toBeCloseTo(valueTextRect.left, 0);
    }
  },
);

Then(
  "the colon between hour and minute is evenly spaced for section {string}'s start and end time",
  async ({ page }, sectionIndex: string) => {
    const section = page.getByTestId(`section-${sectionIndex}`);
    await section.waitFor();
    const seps = section.locator('.abschnitt-time-sep');

    // DOM order (abschnitt.ts): start-hour, ":" (0), start-minute,
    // " - " (1), end-hour, ":" (2), end-minute.
    const pairs = [
      { hour: '[data-start-hour]', sepIndex: 0, minute: '[data-start-minute]' },
      { hour: '[data-end-hour]', sepIndex: 2, minute: '[data-end-minute]' },
    ];

    for (const { hour, sepIndex, minute } of pairs) {
      const hourRect = await textRect(section.locator(hour));
      const sepBox = await seps.nth(sepIndex).boundingBox();
      const minuteRect = await textRect(section.locator(minute));

      expect(sepBox).not.toBeNull();
      const gapBefore = sepBox!.x - hourRect.right;
      const gapAfter = minuteRect.left - (sepBox!.x + sepBox!.width);
      expect(gapBefore).toBeCloseTo(gapAfter, 0);
    }
  },
);

Then(
  "the gap around the range separator is clearly wider than the colon gap for section {string}'s start and end time",
  async ({ page }, sectionIndex: string) => {
    const section = page.getByTestId(`section-${sectionIndex}`);
    await section.waitFor();
    const seps = section.locator('.abschnitt-time-sep');

    // DOM order (abschnitt.ts): start-hour, ":" (0), start-minute,
    // " - " (1), end-hour, ":" (2), end-minute.
    const startMinuteRect = await textRect(
      section.locator('[data-start-minute]'),
    );
    const rangeSepBox = await seps.nth(1).boundingBox();
    const endHourRect = await textRect(section.locator('[data-end-hour]'));
    expect(rangeSepBox).not.toBeNull();

    const rangeGapBefore = rangeSepBox!.x - startMinuteRect.right;
    const rangeGapAfter =
      endHourRect.left - (rangeSepBox!.x + rangeSepBox!.width);

    // Compare against the larger of both colons' gaps in this section, so
    // the assertion holds regardless of which colon happens to be wider
    // and isn't a coin-flip on sub-pixel rounding.
    const colonPairs = [
      { hour: '[data-start-hour]', sepIndex: 0, minute: '[data-start-minute]' },
      { hour: '[data-end-hour]', sepIndex: 2, minute: '[data-end-minute]' },
    ];
    const colonGaps: number[] = [];
    for (const { hour, sepIndex, minute } of colonPairs) {
      const hourRect = await textRect(section.locator(hour));
      const colonSepBox = await seps.nth(sepIndex).boundingBox();
      const minuteRect = await textRect(section.locator(minute));
      expect(colonSepBox).not.toBeNull();
      colonGaps.push(colonSepBox!.x - hourRect.right);
      colonGaps.push(minuteRect.left - (colonSepBox!.x + colonSepBox!.width));
    }
    const maxColonGap = Math.max(...colonGaps);

    // Clears sub-pixel rounding noise so this is a real regression guard,
    // not a bare `>`. Kept small (2 px): the range separator's margin
    // (14 px) beats the colon's leftover-driven gap (~13 px) with room to
    // spare even under the CI container's narrower Liberation Sans digits,
    // so a larger tolerance isn't needed here.
    const MARGIN_PX = 2;
    expect(rangeGapBefore).toBeGreaterThan(maxColonGap + MARGIN_PX);
    expect(rangeGapAfter).toBeGreaterThan(maxColonGap + MARGIN_PX);
  },
);

Then(
  'the section rows do not overflow the section list horizontally',
  async ({ page }) => {
    const list = page.locator('.abschnitt-liste__list');
    await list.waitFor();

    const metrics = await page.evaluate(() => {
      const list = document.querySelector('.abschnitt-liste__list');
      if (!list) {
        throw new Error('Section list not found.');
      }
      const listBox = list.getBoundingClientRect();
      const listRight = listBox.left + list.clientWidth;

      // The rows' own boxes are 100% of the list's content box, so a
      // horizontal overflow shows up only as their children (the fixed-width
      // time range, location cell and icon zone) sticking out beyond the
      // list's content right edge. Also catch a horizontal scrollbar on the
      // list or the document, either of which would mean the row pushed past
      // its container.
      const childRights = Array.from(
        document.querySelectorAll('.abschnitt-row'),
      ).flatMap((row) =>
        Array.from(row.children).map(
          (child) => child.getBoundingClientRect().right,
        ),
      );
      return {
        listRight,
        maxChildRight: Math.max(...childRights),
        listScrollWidth: list.scrollWidth,
        listClientWidth: list.clientWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      };
    });

    // Sub-pixel rounding gets a 0.5px tolerance; anything more means the row
    // actually sticks out of its container.
    expect(metrics.maxChildRight).toBeLessThanOrEqual(metrics.listRight + 0.5);
    expect(metrics.listScrollWidth).toBeLessThanOrEqual(
      metrics.listClientWidth,
    );
    expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
  },
);

Given('I remember the position of the log button', async ({ page }) => {
  rememberedBoxes.set(
    page,
    await readNamedBoxes(page, { logButton: '[data-testid="log-button"]' }),
  );
});

Then('the log button has not moved', async ({ page }) => {
  const before = rememberedBoxes.get(page);
  if (!before) {
    throw new Error(
      'No remembered position — call the "I remember the position of the log button" step first.',
    );
  }
  const after = await readNamedBoxes(page, {
    logButton: '[data-testid="log-button"]',
  });
  expect(after.logButton.x, 'log button x').toBeCloseTo(before.logButton.x, 0);
  expect(after.logButton.y, 'log button y').toBeCloseTo(before.logButton.y, 0);
});

Then(
  'the stempeluhr value and log button share a single line',
  async ({ page }) => {
    const stempeluhr = page.locator('.stempeluhr');
    await stempeluhr.waitFor();
    const box = await stempeluhr.boundingBox();
    const value = await stempeluhr.locator('.stempeluhr__value').boundingBox();
    const button = await stempeluhr
      .locator('.stempeluhr__button')
      .boundingBox();
    expect(box).not.toBeNull();
    expect(value).not.toBeNull();
    expect(button).not.toBeNull();

    // The value and the button differ in height, so they line up on the
    // same grid row only when their vertical centers match.
    const valueCenter = value!.y + value!.height / 2;
    const buttonCenter = button!.y + button!.height / 2;
    expect(
      Math.abs(valueCenter - buttonCenter),
      'value and button on one line',
    ).toBeLessThanOrEqual(1);
    expect(value!.x + value!.width, 'value before button').toBeLessThanOrEqual(
      button!.x + 0.5,
    );
    expect(
      button!.x + button!.width,
      'button inside stempeluhr',
    ).toBeLessThanOrEqual(box!.x + box!.width + 0.5);
  },
);

When('I open the login time editor', async ({ page }) => {
  await page.locator('.stempeluhr [data-action="edit"]').click();
});

When('I abort the login time edit', async ({ page }) => {
  await page.locator('.stempeluhr [data-action="abort"]').click();
});

Given(
  'I remember the position of the stempeluhr and the section list',
  async ({ page }) => {
    rememberedBoxes.set(
      page,
      await readNamedBoxes(page, {
        stempeluhr: '.stempeluhr',
        sectionList: '.abschnitt-liste__list',
      }),
    );
  },
);

Then('the stempeluhr and the section list have not moved', async ({ page }) => {
  const before = rememberedBoxes.get(page);
  if (!before) {
    throw new Error(
      'No remembered position — call the "I remember the position of the stempeluhr and the section list" step first.',
    );
  }
  const after = await readNamedBoxes(page, {
    stempeluhr: '.stempeluhr',
    sectionList: '.abschnitt-liste__list',
  });
  for (const name of ['stempeluhr', 'sectionList'] as const) {
    expect(after[name].x, `${name} x`).toBeCloseTo(before[name].x, 0);
    expect(after[name].y, `${name} y`).toBeCloseTo(before[name].y, 0);
  }
});

When('I go to the previous day', async ({ page }) => {
  await page.locator('[data-prev-link]').click();
});

When(
  'I log in and out {int} times starting at {string} for {int} minutes each',
  async ({ page }, times: number, startTime: string, minutes: number) => {
    const isoDate = await page.evaluate(() =>
      new Date().toISOString().slice(0, 10),
    );
    let [hour, minute, second] = startTime.split(':').map(Number);
    const pad = (n: number) => String(n).padStart(2, '0');
    for (let i = 0; i < times; i++) {
      await page.clock.setFixedTime(
        `${isoDate}T${pad(hour)}:${pad(minute)}:${pad(second)}`,
      );
      await page.getByTestId('log-button').click();

      minute += minutes;
      while (minute >= 60) {
        minute -= 60;
        hour += 1;
      }
      await page.clock.setFixedTime(
        `${isoDate}T${pad(hour)}:${pad(minute)}:${pad(second)}`,
      );
      await page.getByTestId('log-button').click();
    }
  },
);

Then(
  'at least {int} sections are fully visible without scrolling the section list',
  async ({ page }, minCount: number) => {
    const list = page.locator('.abschnitt-liste__list');
    await list.waitFor();
    const listBox = await list.boundingBox();
    expect(listBox).not.toBeNull();

    const items = page.locator('[data-testid^="section-"]');
    const count = await items.count();
    let visible = 0;
    for (let i = 0; i < count; i++) {
      const box = await items.nth(i).boundingBox();
      if (box && box.y + box.height <= listBox!.y + listBox!.height + 0.5) {
        visible++;
      }
    }
    expect(visible).toBeGreaterThanOrEqual(minCount);
  },
);

Then('I see the undo hint', async ({ page }) => {
  await expect(page.getByTestId('undo-toast')).toBeVisible();
});

Then('the undo hint is gone', async ({ page }) => {
  await expect(page.getByTestId('undo-toast')).toHaveCount(0);
});

When('I click the undo button', async ({ page }) => {
  await page.getByTestId('undo-toast').locator('[data-action="undo"]').click();
});

When('I dismiss the undo hint', async ({ page }) => {
  await page
    .getByTestId('undo-toast')
    .locator('[data-action="dismiss-undo"]')
    .click();
});

Then('no sections are left', async ({ page }) => {
  await expect(page.locator('[data-testid^="section-"]')).toHaveCount(0);
});

Then('the page itself does not scroll', async ({ page }) => {
  const scrolled = await page.evaluate(() => {
    window.scrollTo(200, 200);
    const result = { x: window.scrollX, y: window.scrollY };
    window.scrollTo(0, 0);
    return result;
  });
  expect(scrolled.x, 'page horizontal scroll').toBe(0);
  expect(scrolled.y, 'page vertical scroll').toBe(0);
});

When('I reload the page', async ({ page }) => {
  await page.reload();
});

When(
  'the viewport shrinks like the browser toolbar reappearing',
  async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) {
      throw new Error('Viewport size is not set.');
    }
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height - 56,
    });
  },
);

Then('the navigation row is fully visible', async ({ page }) => {
  const viewport = page.viewportSize();
  const row = page.locator('.app-navigation__row');
  await row.waitFor();
  const box = await row.boundingBox();
  if (!box || !viewport) {
    throw new Error('Navigation row or viewport size is not available.');
  }
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
});

When('I click the version info icon', async ({ page }) => {
  await page.getByTestId('version-info').click();
});

Then('I see the version information dialog', async ({ page }) => {
  const dialog = page.getByTestId('version-info-dialog');
  await expect(dialog).toBeVisible();
  const title = dialog.locator('.version-info__title');
  await expect(title).toHaveText('Informationen');
  await expect(dialog).toContainText('Zuletzt geändert');
  await expect(dialog.locator('a').first()).toBeVisible();
});

Then(
  'I can export my data from the version information dialog',
  async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page
      .getByTestId('version-info-dialog')
      .locator('.download-plans')
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^dayplans_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json$/,
    );
  },
);

Then('the version information dialog is gone', async ({ page }) => {
  await expect(page.getByTestId('version-info-dialog')).toBeHidden();
});

Then(
  'the version information dialog is centered on the page',
  async ({ page }) => {
    const box = await page.getByTestId('version-info-dialog').boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) {
      throw new Error('Dialog box or viewport size is not available.');
    }
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    expect(Math.abs(centerX - viewport.width / 2)).toBeLessThanOrEqual(1);
    expect(Math.abs(centerY - viewport.height / 2)).toBeLessThanOrEqual(1);
  },
);

When('I press Escape', async ({ page }) => {
  await page.keyboard.press('Escape');
});

When('I close the version information dialog', async ({ page }) => {
  await page.getByTestId('version-info-close').click();
});

Then(
  'the version information dialog links to the viewport checker',
  async ({ page }) => {
    const link = page
      .getByTestId('version-info-dialog')
      .locator('a[href^="https://mohrm.github.io/viewport-checker"]');
    await expect(link).toHaveAttribute('target', '_blank');
  },
);

When('I open the time distribution', async ({ page }) => {
  await page.getByTestId('open-zeitverteilung').click();
  await page.getByTestId('zeitverteilung-title').waitFor();
});

When('I go back to the day plan', async ({ page }) => {
  await page.getByTestId('back-to-dayplan').click();
  await page.getByTestId('dayplan-title').waitFor();
});

Then(
  'I see the total duration of {string} industrial time',
  async ({ page }, industrialTime: string) => {
    await hasElementWithText(page, 'zeitverteilung-gesamt', industrialTime);
  },
);

Then('I see an entry for unassigned time', async ({ page }) => {
  await expect(page.getByTestId('unverteilt-name')).toHaveText(
    'nicht verteilte Zeit',
  );
});

Then(
  'the unassigned time shows {string} industrial time',
  async ({ page }, industrialTime: string) => {
    await expect(page.getByTestId('unverteilt-minuten')).toHaveText(
      industrialTime,
    );
  },
);

When(
  'I add the free text activity {string} with {string} industrial time',
  async ({ page }, name: string, industrialTime: string) => {
    await page.getByTestId('neue-taetigkeit').fill(name);
    await page
      .getByTestId('neue-taetigkeit-industriezeit')
      .fill(industrialTime);
    await page.getByTestId('add-taetigkeit').click();
    await page.locator('[data-testid="taetigkeit-0"]').waitFor();
  },
);

When(
  'I add the free text activity {string} with {string} percent of the day',
  async ({ page }, name: string, percent: string) => {
    await page.getByTestId('neue-taetigkeit').fill(name);
    await page.getByTestId('neue-taetigkeit-prozent').fill(percent);
    await page.getByTestId('add-taetigkeit').click();
    await page.locator('[data-testid="taetigkeit-0"]').waitFor();
  },
);

When(
  'I pick the previously used activity {string}',
  async ({ page }, name: string) => {
    const input = page.getByTestId('neue-taetigkeit');
    await input.click();
    const option = page.locator(`[data-verlauf-name="${name}"]`);
    await expect(
      option,
      'activity must be offered in the dropdown',
    ).toBeVisible();
    await option.click();
    await expect(input).toHaveValue(name);
  },
);

When(
  'I open the editor for activity {string}',
  async ({ page }, index: string) => {
    const row = page.locator('.zeit-verteilung__row').nth(Number(index));
    await row.locator('[data-action="edit"]').click();
  },
);

When('I abort the activity edit', async ({ page }) => {
  await page.locator('[data-action="abort"]').click();
});

When(
  'I set the duration of activity {string} to {string} industrial time',
  async ({ page }, _index: string, industrialTime: string) => {
    await page.getByTestId('taetigkeit-industriezeit-0').waitFor();
    await page.locator('[data-edit-industriezeit]').fill(industrialTime);
    await page.locator('[data-action="finish"]').click();
  },
);

When(
  'I set the percentage of activity {string} to {string}',
  async ({ page }, _index: string, percent: string) => {
    await page.getByTestId('taetigkeit-prozent-0').waitFor();
    await page.locator('[data-edit-prozent]').fill(percent);
    await page.locator('[data-action="finish"]').click();
  },
);

Then(
  'activity {string} is {string} with {string} industrial time',
  async ({ page }, index: string, name: string, industrialTime: string) => {
    await expect(page.getByTestId(`taetigkeit-${index}`)).toHaveText(name);
    await expect(
      page.getByTestId(`taetigkeit-industriezeit-${index}`),
    ).toHaveText(industrialTime);
  },
);

Then(
  'the duration input of activity {string} shows {string}',
  async ({ page }, index: string, industrialTime: string) => {
    await expect(
      page.getByTestId(`taetigkeit-industriezeit-${index}`),
    ).toHaveText(industrialTime);
  },
);

Then(
  'activity {string} shows {string} exact and rounded industrial time',
  async ({ page }, index: string, combined: string) => {
    const row = page.locator('.zeit-verteilung__row').nth(Number(index));
    await expect(row.locator('.zeit-verteilung__indizes')).toHaveText(combined);
  },
);

Then('I see the time distribution error message', async ({ page }) => {
  await expect(page.getByTestId('zeitverteilung-fehler')).toBeVisible();
});

Then('the day still shows the log button', async ({ page }) => {
  await expect(page.getByTestId('log-button')).toBeVisible();
});

Then('the time distribution title is fully visible', async ({ page }) => {
  const title = page.getByTestId('zeitverteilung-title');
  await expect(title).toBeVisible();
  const box = await title.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize();
  if (box && viewport) {
    expect(box.x, 'title x').toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, 'title right edge').toBeLessThanOrEqual(
      viewport.width,
    );
  }
});

When(
  'I remember the position of the summary and the navigation row',
  async ({ page }) => {
    rememberedBoxes.set(
      page,
      await readNamedBoxes(page, {
        summary: '.abschnitt-summe',
        navigation: '.app-navigation__row',
      }),
    );
  },
);

Then('the summary and the navigation row have not moved', async ({ page }) => {
  const before = rememberedBoxes.get(page);
  if (!before) {
    throw new Error(
      'No remembered position — call the "I remember the position of the summary and the navigation row" step first.',
    );
  }
  const after = await readNamedBoxes(page, {
    summary: '.abschnitt-summe',
    navigation: '.app-navigation__row',
  });
  for (const name of ['summary', 'navigation'] as const) {
    expect(after[name].x, `${name} x`).toBeCloseTo(before[name].x, 0);
    expect(after[name].y, `${name} y`).toBeCloseTo(before[name].y, 0);
  }
});

When('I remember the position of the back button', async ({ page }) => {
  rememberedBoxes.set(
    page,
    await readNamedBoxes(page, {
      backButton: '[data-testid="back-to-dayplan"]',
    }),
  );
});

Then('the back button has not moved', async ({ page }) => {
  const before = rememberedBoxes.get(page);
  if (!before) {
    throw new Error(
      'No remembered position — call the "I remember the position of the back button" step first.',
    );
  }
  const after = await readNamedBoxes(page, {
    backButton: '[data-testid="back-to-dayplan"]',
  });
  expect(after.backButton.x).toBeCloseTo(before.backButton.x, 0);
  expect(after.backButton.y).toBeCloseTo(before.backButton.y, 0);
});

Given(
  'the previous day {string} has the activity {string} with {string} industrial time',
  async ({ page }, day: string, name: string, minutes: string) => {
    const germanDay = day
      .split('-')
      .reverse()
      .map((p) => parseInt(p, 10).toString().padStart(2, '0'))
      .join('.');
    await page.evaluate(
      ([gDay, aName, aMinutes]) => {
        const plans = JSON.parse(localStorage.getItem('plans') ?? '{}');
        plans[gDay] = plans[gDay] ?? {};
        plans[gDay].timeDistribution = [{ name: aName, minutes: aMinutes }];
        localStorage.setItem('plans', JSON.stringify(plans));
      },
      [
        germanDay,
        name,
        Math.round(parseFloat(minutes.replace(',', '.')) * 100),
      ],
    );
  },
);

When(
  'I set the edit duration to {string}',
  async ({ page }, industrialTime: string) => {
    await page.locator('[data-edit-industriezeit]').fill(industrialTime);
  },
);

Then(
  'the percent value of activity {string} is not clipped',
  async ({ page }, index: string) => {
    const cell = page.getByTestId(`taetigkeit-prozent-${index}`);
    await expect(cell).toBeVisible();
    const notClipped = await cell.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const textWidth = range.getBoundingClientRect().width;
      return (
        el.scrollWidth <= el.clientWidth + 1 && textWidth <= el.clientWidth + 1
      );
    });
    expect(notClipped, 'percent value must fit the cell').toBe(true);
  },
);

When('I delete activity {string}', async ({ page }, index: string) => {
  await page
    .locator('.zeit-verteilung__row')
    .nth(Number(index))
    .locator('[data-action="delete"]')
    .click();
});

When(
  'I fill the new activity duration with {string} industrial time',
  async ({ page }, industrialTime: string) => {
    await page
      .getByTestId('neue-taetigkeit-industriezeit')
      .fill(industrialTime);
  },
);

When(
  'I fill the new activity percentage with {string}',
  async ({ page }, percent: string) => {
    await page.getByTestId('neue-taetigkeit-prozent').fill(percent);
  },
);

When('I confirm the new activity', async ({ page }) => {
  await page.getByTestId('add-taetigkeit').click();
  await page.locator('[data-testid="taetigkeit-0"]').waitFor();
});
