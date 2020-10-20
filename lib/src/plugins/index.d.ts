import { AnyMap, PluginEntry, PluginManagerInterface, PluginOptions, PluginServicesManagerInterface } from "../types";
import { DocProcessor } from "../doc-processor";
export declare class PluginManager implements PluginManagerInterface {
    protected plugins: AnyMap;
    isAvailable(name: string): boolean;
    register(name: string, entrypoint: PluginEntry): void;
    /**
     * Registers a plugin from a module reference. Expects the following exported member:
     *
     * - `registerPlugin: PluginEntry`
     *
     * @param name
     * @param modPath
     */
    registerFromModule(name: string, modPath: string): void;
    attach(name: string, docproc: DocProcessor, opts?: PluginOptions): DocProcessor;
}
export declare class PluginServicesManager implements PluginServicesManagerInterface {
    servicesByPlugins: {
        [key: string]: AnyMap;
    };
    addService(pluginName: string, key: string, service: any): void;
    addServices(pluginName: string, services: AnyMap): void;
    getService<T>(pluginName: string, key: string): T | undefined;
}
/**
 * Returns global plugin manager.
 */
export declare const getPluginManager: () => PluginManagerInterface;
export declare const getPluginServicesManager: () => PluginServicesManagerInterface;
