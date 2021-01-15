import fs from "fs";
import {
	AnyMap,
	DocumentSettings,
	PluginEntry,
	PluginManagerInterface,
	PluginMapping,
	PluginOptions,
	PluginOptionsMap,
	PluginServicesManagerInterface,
} from "../types";
import { DocProcessor } from "../doc-processor";

const _MARKDOWN = require("./markdown");
const _DINOMARK = require("./dinomark");

/**
 * Maps a file extension to its base DocumentSettings.
 */
export const SUPPORTED_EXTENSIONS: { [key: string]: DocumentSettings } = {
	md: {
		pluginOptions: {},
		metadata: {},
		plugins: [
			{ name: "markdown", path: `${__dirname}/markdown` },
			{ name: "dinomark", path: `${__dirname}/dinomark` },
		],
	},
};

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
	 * **Note**: make sure your custom modules don't have a name matching the standard plugins, since the standard plugins by that name will be used if the modPath can't be resolved
	 *
	 * @param name
	 * @param modPath
	 */
	registerFromModule(name: string, modPath: string): void {
		if (this.plugins[name]) {
			return;
		}

		// give absolute path to user plugins starting with '.'
		let localModPath: string | undefined;
		if (modPath[0] == "." && !fs.existsSync(`${__dirname}/${modPath}`)) {
			localModPath = `${process.cwd()}/${modPath}`;
		}

		try {
			this.register(
				name,
				require(localModPath ?? modPath).registerPlugin
			);
		} catch (e) {
			// fallback when running
			try {
				this.register(name, require(`./${name}/index`).registerPlugin);
			} catch (f) {
				// @todo report error
				console.error(f);
			}
		}
	}

	attach(name: string, docproc: DocProcessor, opts?: PluginOptions) {
		if (this.plugins[name]) {
			this.plugins[name](docproc, opts);
		}

		return docproc;
	}
}

export class PluginServicesManager implements PluginServicesManagerInterface {
	servicesByPlugins: { [key: string]: AnyMap } = {};
	addService(pluginName: string, key: string, service: any): void {
		if (!this.servicesByPlugins[pluginName]) {
			this.servicesByPlugins[pluginName] = {};
		}

		this.servicesByPlugins[pluginName][key] = service;
	}

	addServices(pluginName: string, services: AnyMap): void {
		for (let key in services) {
			this.addService(pluginName, key, services[key]);
		}
	}

	getService<T>(pluginName: string, key: string): T | undefined {
		return this.servicesByPlugins[pluginName]?.[key];
	}
}

const pluginManager = new PluginManager();
const pluginServicesManager = new PluginServicesManager();

/**
 * Returns global plugin manager.
 */
export const getPluginManager = (): PluginManagerInterface => pluginManager;

export const getPluginServicesManager = (): PluginServicesManagerInterface =>
	pluginServicesManager;

export const loadPluginsForExt = (params: {
	docproc: DocProcessor;
	ext: string;
	pluginOpts?: PluginOptionsMap;
	otherPlugins?: PluginMapping[];
}) => {
	const { docproc, ext } = params;
	let { pluginOpts, otherPlugins } = params;

	const plugins = (SUPPORTED_EXTENSIONS[ext]?.plugins ?? []).concat(
		otherPlugins ?? []
	);

	const pm = getPluginManager();
	plugins.forEach(({ name, path }) => {
		pm.registerFromModule(name, path);
		pm.attach(name, docproc, pluginOpts?.[name]);
	});
};
