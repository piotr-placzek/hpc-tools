import * as puppeteer from 'puppeteer';
import * as db from '../database/db';
import { ProductEntity } from '../database/entities';

const ITEM_SELECTOR = 'li.record-spotlight__item-wrapper > span.recordItem.record-spotlight__item';

const URL = {
  BASE: 'https://www.games-workshop.com/en-WW/detail?N=2401632303&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1684933620000+and+product.endDate+>%3D+1684933620000%5D',
  LAYER: 'https://www.games-workshop.com/en-WW/detail?N=3918877057&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017500000+and+product.endDate+>%3D+1685017500000%5D',
  SHADE: 'https://www.games-workshop.com/en-WW/detail?N=882366425&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017500000+and+product.endDate+>%3D+1685017500000%5D',
  DRY: 'https://www.games-workshop.com/en-WW/detail?N=2719312672&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017560000+and+product.endDate+>%3D+1685017560000%5D',
  CONTRAST: 'https://www.games-workshop.com/en-WW/detail?N=3891072176&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017560000+and+product.endDate+>%3D+1685017560000%5D',
  TECHNICAL: 'https://www.games-workshop.com/en-WW/detail?N=3388174230&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017620000+and+product.endDate+>%3D+1685017620000%5D',
  AIR: 'https://www.games-workshop.com/en-WW/detail?N=865704738&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017620000+and+product.endDate+>%3D+1685017620000%5D',
  SPRAYS: 'https://www.games-workshop.com/en-WW/detail?N=434579619&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017680000+and+product.endDate+>%3D+1685017680000%5D',
};

interface GamesWorkshopProduct {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface GtmProductFieldObject {
  category: string;
  id: string;
  name: string;
  position: number;
  price: string;
  quantity: number;
}

interface ListElement extends Element {
  dataset: {
    gtmProductfieldobject: string;
    name: string;
    tooltip: string;
  };
}

async function getProducts(url: string): Promise<GamesWorkshopProduct[]> {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(url);
  await page.waitForSelector(ITEM_SELECTOR, { visible: true });

  const evaluationResults = await page.evaluate((selector: string): GamesWorkshopProduct[] => {
    const elements: NodeListOf<ListElement> = document.querySelectorAll(selector);
    const products: GamesWorkshopProduct[] = [];
    for (const element of elements) {
      const gtmProductFieldObject: GtmProductFieldObject = JSON.parse(element.dataset.gtmProductfieldobject);
      const image: string = document.querySelector(`img[data-name='${element.dataset.name}']`)?.getAttribute('src') || 'dupa';
      const product: GamesWorkshopProduct = {
        id: gtmProductFieldObject.id,
        name: element.dataset.tooltip,
        description: gtmProductFieldObject.name,
        image: image
      };
      products.push(product);
    }
    return products;
  }, ITEM_SELECTOR);

  browser.close();

  return evaluationResults;
}

async function getAllProducts(): Promise<GamesWorkshopProduct[]> {
  const allProducts: GamesWorkshopProduct[] = [];
  for (const url of Object.values(URL)) {
    const products: GamesWorkshopProduct[] = await getProducts(url);
    allProducts.push(...products);
  }
  return allProducts;
}

async function storeProducts(products: GamesWorkshopProduct[]): Promise<void> {
  db.insertProducts(products.map((product: GamesWorkshopProduct): ProductEntity => ({
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.image,
    manufacturer: 'games-workshop',
    owned: 0,
    wishlisted: 0,
  })));
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
