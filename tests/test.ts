import { expect, test } from '@playwright/test';

test('index displays page details', async ({ page }) => {
	await page.goto('/?title=Foo&text=Foo bar&url=http://example.com');

	expect(await page.textContent('.title')).toBe('Foo');
	expect(await page.textContent('.text')).toBe('Foo bar');
	expect(await page.textContent('.url')).toBe('http://example.com');
});
