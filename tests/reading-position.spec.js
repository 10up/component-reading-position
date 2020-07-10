import puppeteer from 'puppeteer';

const APP = 'https://10up.github.io/component-reading-position/demo/demo-test.html';
const width = 1440;
const height = 860;

let page;
let browser;

function delay(timeout) {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
}

beforeEach( async () => {

	browser = await puppeteer.launch( {
		headless: true,
	} );

	page = await browser.newPage();

	await page.setViewport( {
		width,
		height
	} );

	await page.goto( APP, { waitUntil: 'networkidle0' } );

} );

describe( 'Functionality Tests', () => {

	test( 'starts with percentage of 0', async () => {

		const progressElement = await page.$('progress');
		const percentageHandle = await progressElement.getProperty( 'value' );
		const percentage = await percentageHandle.jsonValue();

		expect( percentage ).toBe( 0 );

	} );

	test( 'updates the percentage when scrolled', async () => {

		await page.evaluate( () => {
			// initiates the reading position indicator
			new TenUp.readingPosition( '.reading-position' );
			window.scrollBy(0, 20000);
			return;
		} );

		await delay(500);

		const progressElement = await page.$( 'progress' );
		const percentage = await ( await progressElement.getProperty('value') ).jsonValue();

		expect( percentage ).toBe( 100 );

	} );

} );

describe( 'Callback Function Tests', () => {

	test( 'onCreate', async () => {

		const onCreate = jest.fn();

		await page.exposeFunction('onCreate', onCreate);

		await page.evaluate( () => {
			// initiates the reading position indicator
			new TenUp.readingPosition( '.reading-position', {
				onCreate,
			} );

			return;

		} );

		expect( onCreate ).toHaveBeenCalledTimes(1);


	} );

	test( 'scrollStart', async () => {

		const scrollStart = jest.fn();

		await page.exposeFunction( 'scrollStart', scrollStart );

		await page.evaluate( () => {
			// initiates the reading position
			new TenUp.readingPosition( '.reading-position', {
				scrollStart,
			} );

			window.scrollBy( 0, 500 );

			return;

		} );

		await delay(500);

		expect( scrollStart ).toHaveBeenCalledTimes(1);

	} );

	test( 'scrollEnd', async () => {

		// Visit the page in headless Chrome
		await page.goto( APP, { waitUntil: 'networkidle0' } );

		const scrollEnd = jest.fn();

		await page.exposeFunction( 'scrollEnd', scrollEnd );

		await page.evaluate( () => {
			// initiates the reading position
			new TenUp.readingPosition( '.reading-position', {
				scrollEnd,
			} );

			window.scrollBy( 0, 400 );
			setTimeout( () => {
				window.scrollBy( 0, 9000 );
			}, 200 );

			return;

		} );

		await delay( 500 );

		expect( scrollEnd ).toHaveBeenCalled();

	} );

} );

afterEach( () => {
	browser.close();
} );
