import * as puppeteer from 'puppeteer';
import { RawProduct, scrape } from './scraper-base';
import { db, stdout } from '../storage';

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

interface ArmyPainterProduct extends RawProduct {
  manufacturer: 'army-painter';
}

interface ListElement extends Element {
  alt: string;
  currentSrc: string;
}

function sourceUrlsFactory(): string[] {
  const sourceUrls: string[] = [];
  for (const [key, value] of Object.entries(URL)) {
    if (!Object.keys(PAGE_CNT).includes(key)) {
      sourceUrls.push(value);
    } else {
      for (let i = 0, j = 1; i < PAGE_CNT[key]; i++, j++) {
        sourceUrls.push(value + '?page=' + j);
      }
    }
  }
  return sourceUrls;
}

async function scrapingStrategy(page: puppeteer.Page): Promise<ArmyPainterProduct[]> {
  return page.evaluate((ITEM_SELECTOR: string): ArmyPainterProduct[] => {
    const products: ArmyPainterProduct[] = [];
    const extractId = (imageSrc: string): string => {
      return imageSrc.split('/')
                     .slice(-1)[0]
                     .split('_')
                     .filter((s: string): boolean => 
                        s.startsWith('WP') ||
                        s.startsWith('AW') ||
                        s.startsWith('CP') ||
                        s.startsWith('GM') )[0];
    };
    const extractName = (imageAlt: string): string => {
      const alt = imageAlt.split(': ');
      return alt[1] || alt[0];
    }

    const nodeListOfElements: NodeListOf<ListElement> = document.querySelectorAll(ITEM_SELECTOR);
    for(let element of Array.from(nodeListOfElements)) {
      products.push({
        id: extractId(element.getAttribute('src')!),
        name: extractName(element.getAttribute('alt')!),
        image: element.getAttribute('src')!,
        description: element.getAttribute('alt')!,
        manufacturer: 'army-painter',
      });
    }

    return products;
  }, ITEM_SELECTOR);
}

scrape(sourceUrlsFactory(), scrapingStrategy, ITEM_SELECTOR, db);
