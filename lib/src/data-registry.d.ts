import { AnyMap, DataRegistryInterface } from "./types";
export declare type DataCategoryMap = {
    [key: string]: AnyMap[];
};
export declare class DataRegistry implements DataRegistryInterface {
    protected categories: DataCategoryMap;
    protected initCategory(category: string): void;
    addItem(category: string, item: AnyMap): void;
    addItems(category: string, items: AnyMap[]): void;
    getItems(category: string): AnyMap[];
    count(category: string): number;
}
export declare const makeDataRegistry: () => DataRegistryInterface;
