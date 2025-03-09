import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { AppPagePO } from '../page-objects/app.po';

const { Given, Then } = createBdd();


Given('I open the home page', async ({ page }) => {
    await AppPagePO.navigateTo(page, '/');
  });
  
Then('I see {string} on the page', async ({ page }, theString) => {
  await AppPagePO.hasElementWithText(page, 'dayplan-title', theString);
});