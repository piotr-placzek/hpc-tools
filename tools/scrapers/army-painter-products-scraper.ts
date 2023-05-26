import * as puppeteer from 'puppeteer';
import * as db from '../database/db';
import { ProductEntity } from '../database/entities';

const ITEM_SELECTOR = 'li.ProductCard figure.ProductCard-Figure img.Image-Image';

const URL: { [key: string]: string } = {
  WARPAINTS: 'https://www.thearmypainter.com/shop/eu/warpaints/singles',
  WASHES: 'https://www.thearmypainter.com/shop/eu/quickshade/washes',
  DIPS: 'https://www.thearmypainter.com/shop/eu/quickshade/dips',
  AIRBRUSH: 'https://www.thearmypainter.com/shop/eu/airbrush/singles',
  COLOUR_PRIMER: 'https://www.thearmypainter.com/shop/eu/sprays/colour-primer',
  TERRAIN_PRIMER: 'https://www.thearmypainter.com/shop/eu/sprays/terrain-primer',
  VARNISH: 'https://www.thearmypainter.com/shop/eu/sprays/varnish',
  // WARPAINTS_SET: 'https://www.thearmypainter.com/shop/eu/warpaints/boxed-sets',
  // WARPAINTS_LICENSED: 'https://www.thearmypainter.com/shop/eu/warpaints/licensed',
  // AIRBRUSH_SET: 'https://www.thearmypainter.com/shop/eu/airbrush/boxed-sets',
};

const PAGE_CNT: { [key: string]: number } = {
  WARPAINTS: 6,
  AIRBRUSH: 6,
  COLOUR_PRIMER: 2,
};

interface ArmyPainterProduct {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface ListElement extends Element {
  alt: string;
  currentSrc: string;
}

async function getProducts(url: string): Promise<ArmyPainterProduct[]> {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url);
  await page.waitForSelector(ITEM_SELECTOR, { visible: true });

  const evaluationResults: ArmyPainterProduct[] = await page.evaluate((selector: string): ArmyPainterProduct[] => {
    const elements: NodeListOf<ListElement> = document.querySelectorAll(selector);
    const products: ArmyPainterProduct[] = [];

    const extractId = (url: string): string => {
      return url.split('/').slice(-1)[0].split('_').filter((s: string) => s.startsWith('WP') || s.startsWith('AW') || s.startsWith('CP') || s.startsWith('GM'))[0];
    };

    const extractName = (alt: string): string => {
      const splited = alt.split(': ');
      return splited[1] ? splited[1] : splited[0];
    };

    for (const element of elements) {
      const product: ArmyPainterProduct = {
        id: extractId(element.currentSrc),
        name: extractName(element.alt),
        description: element.alt,
        image: element.currentSrc,
      };
      products.push(product);
    }
    return products;
  }, ITEM_SELECTOR);

  browser.close();

  return evaluationResults;
}

async function getAllProducts(): Promise<ArmyPainterProduct[]> {
  const allProducts: ArmyPainterProduct[] = [];

  for (const [key, value] of Object.entries(URL)) {
    if (!Object.keys(PAGE_CNT).includes(value)) {
      allProducts.push(...(await getProducts(value)));
      continue;
    }

    for (let i = 0, j = 1; i < PAGE_CNT[key]; i++, j++) {
      allProducts.push(...(await getProducts(value + '?page=' + j)));
    }
  }
  return allProducts;
}

async function storeProducts(products: ArmyPainterProduct[]): Promise<void> {
console.log(products)
  // db.insertProducts(
  //   products
  //     .filter((product: ArmyPainterProduct) => product.id)
  //     .map(
  //       (product: ArmyPainterProduct): ProductEntity => ({
  //         id: product.id,
  //         name: product.name,
  //         description: product.description,
  //         image: product.image,
  //         manufacturer: 'army-painter',
  //         owned: 0,
  //         wishlisted: 0,
  //       }),
  //     ),
  // );
}

async function scrape(): Promise<void> {
  try {
    const products = await getAllProducts();
    await storeProducts(products);
  } catch (error) {
    console.log(error);
  }
}

scrape();
