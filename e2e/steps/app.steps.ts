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

  expect(await page.getByTestId('section-'+sectionIndex)).toContainText(start + " - " + end)
});