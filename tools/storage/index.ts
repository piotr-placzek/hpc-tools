import { RawProduct } from '../scrapers/scraper-base'
export * as db from './database/sqlite'

export interface StorageBase {
  insertProducts: (products: RawProduct[]) => Promise<void>;
}

export const stdout: StorageBase = {
  insertProducts: async (products: RawProduct[]): Promise<void> => {
    console.table(products);
  }
};

