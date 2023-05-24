import * as puppeteer from 'puppeteer';

interface GwListItem extends Element {
    dataset: {
        gtmProductfieldobject: string;
        name: string;
        tooltip: string;
    };
}

const URL = {
    BASE: 'https://www.games-workshop.com/en-WW/detail?N=2401632303&Nr=AND%28product.locale%3Aen_WW_gw%2Csku.siteId%3AWW_gw%29&Nrs=collection%28%29%2Frecord%5Bproduct.startDate+<%3D+1684933620000+and+product.endDate+>%3D+1684933620000%5D',
};

async function test() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(URL.BASE);
    await page.waitForSelector('ul.search__product-list.product-grid', { visible: true });

    const list = await page.evaluate(() => {
        const items: NodeListOf<GwListItem> = document.querySelectorAll(
            'li.record-spotlight__item-wrapper > span.recordItem.record-spotlight__item',
        );
        const list: string[] = [];
        for (const item of items) {
            list.push(item.dataset!.tooltip);
        }
        return list;
    });

    console.log(list.length);

    await browser.close();
}

test();
