import Database from 'better-sqlite3';
import { ProductEntity } from './entities';

const DB = 'database.sqlite';

export function insertProducts(products: ProductEntity[]): void {
  const values = products.map((product: ProductEntity) => 
    `('${product.id}','${product.manufacturer}','${product.name.replaceAll('\'','')}','${product.description.replaceAll('\'','')}',${product.owned},${product.wishlisted})`
  );
  db().exec(`
    INSERT INTO products (id, manufacturer, name, description, owned, wishlisted)
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
      owned INTEGER,
      wishlisted INTEGER,
      PRIMARY KEY (id, manufacturer)
    );
  `);
}

init(DB, true, false);

