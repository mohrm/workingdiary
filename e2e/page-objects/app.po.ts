import { Locator, Page, expect } from '@playwright/test';

export class AppPagePO {

  static navigateTo(page: Page, path: string): Promise<unknown> {
    return page.goto(path);
  }

  static hasElementWithText(page: Page, testId: string, expectedText: string): Promise<unknown> {
    return expect(page.getByTestId("dayplan-title")).toContainText(expectedText);
  }

  static getTitle(page: Page): Locator {
    return page.locator('.toolbar span');
  }

  static getRocket(page: Page): Locator {
    return page.locator('#message-section');
  }
}