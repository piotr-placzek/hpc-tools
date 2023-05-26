import * as puppeteer from 'puppeteer';

export interface RawProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  manufacturer: string;
}

export type ScrapingStrategy = (page: puppeteer.Page) => Promise<RawProduct[]>;

// temporary export
export interface StorageBase {
  insertProducts: (products: RawProduct[]) => Promise<void>;
}

export async function scrape(
  sourceUrls: string[],
  strategy: ScrapingStrategy,
  itemSelector: string,
  storage: StorageBase,
): Promise<void> {
  try {
    storage.insertProducts(await getAllProducts(sourceUrls, strategy, itemSelector));
  } catch (error) {
    console.log(error);
  }
}

async function getAllProducts(
  sourceUrls: string[],
  strategy: ScrapingStrategy,
  itemSelector: string,
): Promise<RawProduct[]> {
  const allProducts: RawProduct[] = [];

  for (let sourceUrl of sourceUrls) {
    allProducts.push(...(await getProducts(sourceUrl, strategy, itemSelector)));
  }

  return allProducts;
}

async function getProducts(sourceUrl: string, strategy: ScrapingStrategy, itemSelector: string): Promise<RawProduct[]> {
  const browser: puppeteer.Browser = await puppeteer.launch({ headless: false });
  const page: puppeteer.Page = await browser.newPage();
  await page.goto(sourceUrl);
  await page.waitForSelector(itemSelector, { visible: true });
  const products: RawProduct[] = await strategy(page);
  await browser.close();
  return products.filter((product: RawProduct) => product.id);
}
