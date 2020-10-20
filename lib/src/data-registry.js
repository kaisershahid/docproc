"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDataRegistry = exports.DataRegistry = void 0;
class DataRegistry {
    constructor() {
        this.categories = {};
    }
    initCategory(category) {
        if (this.categories[category] === undefined) {
            this.categories[category] = [];
        }
    }
    addItem(category, item) {
        this.initCategory(category);
        this.categories[category].push(item);
    }
    addItems(category, items) {
        this.categories[category] = this.categories[category].concat(items);
    }
    getItems(category) {
        this.initCategory(category);
        return [...this.categories[category]];
    }
    count(category) {
        this.initCategory(category);
        return this.categories[category].length;
    }
}
exports.DataRegistry = DataRegistry;
exports.makeDataRegistry = () => {
    return new DataRegistry();
};
