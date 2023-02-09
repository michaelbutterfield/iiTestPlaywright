import { test, expect, type Page } from '@playwright/test';

test.describe('Services links', () => {
	test.beforeEach(async ({ page, browserName }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		while (page.url() === 'https://www.ii.co.uk/new-homepage') {
			await page.goto('/');
		}

		// Expect a title "to contain" a substring.
		await expect(page).toHaveURL('https://www.ii.co.uk/');
		await expect(page).toHaveTitle('interactive investor – the UK’s number one flat-fee investment platform');
	});

	test('should iterate through all the services links and assert the URL is as expected', async ({ page, browserName }) => {
		await page.click('//button[text()="Accept"]');
		const headerLinks = await page.$$('//div[@id="navigationItemServices"]//li[@class="ii-1ai24k"]/a');

		for (let i = 0; i < headerLinks.length; i++) {
			let linkText = await headerLinks[i].getAttribute('href');
			let expectedUrl = `https://www.ii.co.uk${linkText}`;
			await page.locator("//span[@title='Services']").click();

			// get the new page
			const [newPage] = await Promise.all([
				// get `context` by destructuring with `page` in the test params; 'page' is a built-in event, and **you must wait for this like this,**, or `newPage` will just be the response object, rather than an actual Playwright page object.
				page.context().waitForEvent('page'),

				// note that, like all waiting in Playwright, this is somewhat unintuitive. This is the action which is *causing the navigation*; you have to set up the wait *before* it happens, hence the use of Promise.all().
				await headerLinks[i].click({ modifiers: ['Control'] }),
			]);

			// wait for the new tab to fully load
			await newPage.bringToFront();

			if (newPage.url() === `${expectedUrl}-n`) {
				newPage.goto(expectedUrl);
			}
			// now, use `newPage` to access the newly opened tab, rather than `page`, which will still refer to the original page/tab.
			await expect(newPage).toHaveURL(expectedUrl);

			await newPage.close();
		}
	});
});
