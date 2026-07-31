import { expect, type Locator, type Page } from '@playwright/test';

export function navigateTo(page: Page, path: string): Promise<unknown> {
  return page.goto(path);
}

export function hasElementWithText(
  page: Page,
  testId: string,
  expectedText: string,
): Promise<unknown> {
  return expect(page.getByTestId(testId)).toContainText(expectedText);
}

export function getTitle(page: Page): Locator {
  return page.locator('.toolbar span');
}

export function getRocket(page: Page): Locator {
  return page.locator('#message-section');
}
