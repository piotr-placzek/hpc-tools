import * as puppeteer from 'puppeteer';
import { RawProduct, scrape } from './scraper-base';
import { db, stdout } from '../storage';

const ITEM_SELECTOR = 'li.record-spotlight__item-wrapper > span.recordItem.record-spotlight__item';

const URL = {
  BASE: 'https://www.games-workshop.com/en-WW/detail?N=2401632303&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1684933620000+and+product.endDate+>%3D+1684933620000%5D',
  LAYER:
    'https://www.games-workshop.com/en-WW/detail?N=3918877057&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017500000+and+product.endDate+>%3D+1685017500000%5D',
  SHADE:
    'https://www.games-workshop.com/en-WW/detail?N=882366425&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017500000+and+product.endDate+>%3D+1685017500000%5D',
  DRY: 'https://www.games-workshop.com/en-WW/detail?N=2719312672&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017560000+and+product.endDate+>%3D+1685017560000%5D',
  CONTRAST:
    'https://www.games-workshop.com/en-WW/detail?N=3891072176&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017560000+and+product.endDate+>%3D+1685017560000%5D',
  TECHNICAL:
    'https://www.games-workshop.com/en-WW/detail?N=3388174230&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017620000+and+product.endDate+>%3D+1685017620000%5D',
  AIR: 'https://www.games-workshop.com/en-WW/detail?N=865704738&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017620000+and+product.endDate+>%3D+1685017620000%5D',
  SPRAYS:
    'https://www.games-workshop.com/en-WW/detail?N=434579619&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1685017680000+and+product.endDate+>%3D+1685017680000%5D',
};

interface GamesWorkshopProduct extends RawProduct {
  manufacturer: 'games-workshop';
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

function sourceUrlsFactory(): string[] {
  return Object.values(URL);
}

async function scrapingStrategy(page: puppeteer.Page): Promise<GamesWorkshopProduct[]> {
  return page.evaluate((ITEM_SELECTOR: string): GamesWorkshopProduct[] => {
    const products: GamesWorkshopProduct[] = [];
    const nodeListOfElements: NodeListOf<ListElement> = document.querySelectorAll(ITEM_SELECTOR);
    for (let element of Array.from(nodeListOfElements)) {
      const gtmProductFieldObject: GtmProductFieldObject = JSON.parse(element.dataset.gtmProductfieldobject);
      const image: string = document.querySelector(`img[data-name='${element.dataset.name}']`)?.getAttribute('src')!;
      products.push({
        id: gtmProductFieldObject.id,
        name: element.dataset.name,
        description: gtmProductFieldObject.name,
        image: image,
        manufacturer: 'games-workshop',
      });
    }

    return products;
  }, ITEM_SELECTOR);
}

scrape(sourceUrlsFactory(), scrapingStrategy, ITEM_SELECTOR, db);

