import fs from "fs";
import path from "path";
import {
	AnyMap,
	DocumentSettings,
	PluginMapping,
	PluginOptionsMap,
	SourcePathContext,
	SysSettings,
} from "../types";
import { SUPPORTED_EXTENSIONS, loadPluginsForExt } from "../plugins/index";
import { DocProcessor } from "../doc-processor";

export const DOCUMENT_SETTINGS_NAME = ".docproc.json";

export type CLIParams = { settingsDir?: string; settingsName?: string };

export const normalizeDocumentSettings = (settings: any): DocumentSettings => {
	const plugins = settings?.plugins as PluginMapping[];
	const pluginOptions = settings?.pluginOptions as PluginOptionsMap;
	const metadata = settings?.metadata as AnyMap;

	return {
		plugins: plugins ?? [],
		pluginOptions: pluginOptions ?? {},
		metadata: metadata ?? {},
	};
};

export const getDocumentSettings = (
	dirPath?: string,
	fileName?: string
): DocumentSettings => {
	const path = `${dirPath ?? process.cwd()}/${
		fileName ?? DOCUMENT_SETTINGS_NAME
	}`;
	if (fs.existsSync(path)) {
		return normalizeDocumentSettings(
			JSON.parse(fs.readFileSync(path).toString())
		);
	}

	return normalizeDocumentSettings({});
};

export const parseFilePath = (filePath: string): SourcePathContext => {
	const parts = filePath.split("/");
	const baseName = parts.pop() as string;
	const extParts = baseName.split(".");
	const ext = extParts.pop() ?? "";
	return {
		filePath,
		basePath: parts.join("/"),
		baseName,
		baseNameNoExt: extParts.join("."),
		ext,
	};
};

/**
 * Generates the document processor instance and:
 *
 * 1. creates the document settings context
 * 2. creates the document context (path info)
 * 3. creates the initial vars map with sys settings
 * 4. loads extension and custom plugins
 *
 * @param filePath
 * @param params
 */
export const getDocProcForFile = (filePath: string, params?: CLIParams) => {
	const sourceContext = parseFilePath(filePath);
	const { ext } = sourceContext;
	if (!SUPPORTED_EXTENSIONS[ext]) {
		throw new Error(`the extension '${ext}' is not supported`);
	}
	if (!fs.existsSync(filePath)) {
		throw new Error(`'${filePath}' does not exist`);
	}

	const vars = {
		sys: makeSysSettings(sourceContext, params),
	};
	// console.log("SYS", vars.sys);

	const docproc = new DocProcessor({ vars });
	loadPluginsFromDocSettings(docproc, vars.sys);
	return { docproc, sourceContext };
};

export const makeSysSettings = (
	sourceContext: SourcePathContext,
	params?: CLIParams
): SysSettings => {
	const { filePath, ext } = sourceContext;
	const absPath = path.resolve(filePath);

	// create file/dir context for settings
	const settingsContext = {
		settingsDir: params?.settingsDir ?? sourceContext.basePath,
		settingsName: params?.settingsName ?? DOCUMENT_SETTINGS_NAME,
	};

	// create settings from context
	const fileDir = path.dirname(filePath);
	const settings = getDocumentSettings(
		settingsContext.settingsDir,
		settingsContext.settingsName
	);

	return {
		doc: { ...sourceContext, ...settingsContext, settings },
	};
};

export const loadPluginsFromDocSettings = (
	docproc: DocProcessor,
	settings: SysSettings
) => {
	const docSet = settings.doc;
	loadPluginsForExt({
		docproc,
		ext: docSet.ext,
		otherPlugins: docSet.settings.plugins,
		pluginOpts: docSet.settings.pluginOptions,
	});
};
