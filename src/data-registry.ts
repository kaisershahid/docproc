import { AnyMap, DataRegistryInterface } from "./types";

export type DataCategoryMap = {
  [key: string]: AnyMap[];
};

export class DataRegistry implements DataRegistryInterface {
  protected categories: DataCategoryMap = {};

  protected initCategory(category: string): void {
    if (this.categories[category] === undefined) {
      this.categories[category] = [];
    }
  }

  addItem(category: string, item: AnyMap): void {
    this.initCategory(category);
    this.categories[category].push(item);
  }

  addItems(category: string, items: AnyMap[]): void {
    this.categories[category] = this.categories[category].concat(items);
  }

  getItems(category: string): AnyMap[] {
    this.initCategory(category);
    return [...this.categories[category]];
  }

  count(category: string): number {
    this.initCategory(category);
    return this.categories[category].length;
  }
}

export const makeDataRegistry = (): DataRegistryInterface => {
  return new DataRegistry();
};
