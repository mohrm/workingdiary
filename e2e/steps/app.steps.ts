import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { AppPagePO } from '../page-objects/app.po';

const { Given, When, Then } = createBdd();


Given('I open the home page', async ({ page }) => {
    
  });
  
Then('I see {string} on the page', async ({ page }, theString) => {
  
});


Given('today\'s date is {string} and the current time is {string}', async ({ page }, day: string, time: string) => {
  await page.clock.setFixedTime(day + "T" + time);
});

Given('the viewport is mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
});

When('I open the day plan for today', async ({ page }) => {
  await AppPagePO.navigateTo(page, '/');
});

Then('I see {string} on the heading', async ({ page }, expectedHeadingText: string) => {
  await AppPagePO.hasElementWithText(page, 'dayplan-title', expectedHeadingText);
});

When('I log in', async ({ page }) => {
  // Step: And I log in
  // From: features/app.feature:11:5
  await page.getByTestId('log-button').click()
});

Then('I see that the login time is {string}', async ({ page }, arg: string) => {
  await AppPagePO.hasElementWithText(page, 'login-time', arg)
  // Step: Then I see that the login time is "08:00"
  // From: features/app.feature:12:5
});

Then('the caption of the log button is {string}', async ({ page }, arg: string) => {
  // Step: And the caption of the log button is "Ausstempeln"
  // From: features/app.feature:13:5
  await AppPagePO.hasElementWithText(page, 'log-button', arg)
});

Given('time moves forward to {string} at {string}', async ({ page }, day: string, time: string) => {
  // Step: And time moves forward to "2025-02-17" at "12:00:00"
  // From: features/app.feature:21:5
  await page.clock.setFixedTime(day + "T" + time);
});

When('I log out', async ({ page }) => {
  // Step: When I log out
  // From: features/app.feature:21:7
  await page.getByTestId('log-button').click()
});

Then('I see that section {string} has start time {string} and end time {string}', async ({ page }, sectionIndex: string, start: string, end: string) => {
  // Step: Then I see that section "0" has start time "08:00" and end time "09:00"
  // From: features/app.feature:27:5
  const sec = page.getByTestId('section-'+sectionIndex)
  await sec.waitFor()
  expect(sec).toContainText(start + " - " + end)
});

When('I open the editor for section {string}', async ({ page }, sectionIndex: string) => {
  const section = page.getByTestId('section-'+sectionIndex);
  await section.waitFor();
  const editIcon = section.locator('mat-icon', { hasText: 'edit' }).first();
  await editIcon.click();
});

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
