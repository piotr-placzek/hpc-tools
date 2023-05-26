import Database from 'better-sqlite3';
import { RawProduct } from '../../scrapers/scraper-base';

const DB = 'database.sqlite';

export async function insertProducts(products: RawProduct[]): Promise<void> {
  const values = products.map(
    (product: RawProduct) =>
      `('${product.id}','${product.manufacturer}','${product.name.replaceAll(
        "'",
        '',
      )}','${product.description.replaceAll("'", '')}','${product.image}',0,0)`,
  );
  await db(DB, true).exec(`
    INSERT OR IGNORE INTO products (id, manufacturer, name, description, image, owned, wishlisted)
    VALUES ${values.join(',')};
  `);
}

function db(path: string = DB, verbose: boolean = false, fileMustExist: boolean = true): any {
  return new Database(path, {
    fileMustExist,
    verbose: verbose ? console.log : undefined,
  });
}

function init(path: string, verbose: boolean = false, fileMustExist: boolean = true): void {
  db(path, verbose, fileMustExist).exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT,
      manufacturer TEXT,
      name TEXT,
      description TEXT,
      image TEXT,
      owned INTEGER,
      wishlisted INTEGER,
      PRIMARY KEY (id, manufacturer)
    );
  `);
}

init(DB, true, false);
