"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPluginServicesManager = exports.getPluginManager = exports.PluginServicesManager = exports.PluginManager = void 0;
const fs_1 = __importDefault(require("fs"));
class PluginManager {
    constructor() {
        this.plugins = {};
    }
    isAvailable(name) {
        return this.plugins[name] !== undefined;
    }
    register(name, entrypoint) {
        this.plugins[name] = entrypoint;
    }
    /**
     * Registers a plugin from a module reference. Expects the following exported member:
     *
     * - `registerPlugin: PluginEntry`
     *
     * @param name
     * @param modPath
     */
    registerFromModule(name, modPath) {
        if (this.plugins[name]) {
            return;
        }
        // give absolute path to user plugins starting with '.'
        let localModPath;
        if (modPath[0] == "." && !fs_1.default.existsSync(`${__dirname}/../${modPath}`)) {
            localModPath = `${process.cwd()}/${modPath}`;
        }
        try {
            this.register(name, require(localModPath ?? modPath).registerPlugin);
        }
        catch (e) {
            // @todo report error
            console.error(e);
        }
    }
    attach(name, docproc, opts) {
        if (this.plugins[name]) {
            this.plugins[name](docproc, opts);
        }
        return docproc;
    }
}
exports.PluginManager = PluginManager;
class PluginServicesManager {
    constructor() {
        this.servicesByPlugins = {};
    }
    addService(pluginName, key, service) {
        if (!this.servicesByPlugins[pluginName]) {
            this.servicesByPlugins[pluginName] = {};
        }
        this.servicesByPlugins[pluginName][key] = service;
    }
    addServices(pluginName, services) {
        for (let key in services) {
            this.addService(pluginName, key, services[key]);
        }
    }
    getService(pluginName, key) {
        return this.servicesByPlugins[pluginName]?.[key];
    }
}
exports.PluginServicesManager = PluginServicesManager;
const pluginManager = new PluginManager();
const pluginServicesManager = new PluginServicesManager();
/**
 * Returns global plugin manager.
 */
exports.getPluginManager = () => pluginManager;
exports.getPluginServicesManager = () => pluginServicesManager;
