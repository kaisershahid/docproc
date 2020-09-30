import {
  AnyMap,
  PluginEntry,
  PluginManagerInterface,
  PluginOptions,
} from "../types";
import { DocProcessor } from "../doc-processor";

export class PluginManager implements PluginManagerInterface {
  protected plugins: AnyMap = {};

  isAvailable(name: string): boolean {
    return this.plugins[name] !== undefined;
  }

  register(name: string, entrypoint: PluginEntry): void {
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
  registerFromModule(name: string, modPath: string): void {
    if (this.plugins[name]) {
      return;
    }

    try {
      this.register(name, require(modPath).registerPlugin);
    } catch (e) {
      // @todo report error
      console.error(e);
    }
  }

  attach(name: string, docproc: DocProcessor, opts?: PluginOptions) {
    if (this.plugins[name]) {
      this.plugins[name](docproc, opts);
    }

    return docproc;
  }
}

const pluginManager = new PluginManager();

/**
 * Returns global plugin manager.
 */
export const getPluginManager = (): PluginManagerInterface => pluginManager;
