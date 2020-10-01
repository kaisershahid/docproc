import fs from "fs";
import path from "path";
import {
  AnyMap,
  DocumentSettings,
  PluginMapping,
  PluginOptionsMap,
  SysSettings,
} from "./types";
import { getPluginManager } from "./plugins";
import { DocProcessor } from "./doc-processor";
import set = Reflect.set;

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

/**
 * Maps a file extension to its base DocumentSettings.
 */
const SUPPORTED_EXTENSIONS: { [key: string]: DocumentSettings } = {
  md: {
    pluginOptions: {},
    metadata: {},
    plugins: [
      { name: "markdown", path: `${__dirname}/plugins/markdown` },
      { name: "dinomark", path: `${__dirname}/plugins/dinomark` },
    ],
  },
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
  const ext = filePath.split(".").pop() ?? "";
  if (!SUPPORTED_EXTENSIONS[ext]) {
    throw new Error(`the extension '${ext}' is not supported`);
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`'${filePath}' does not exist`);
  }

  const vars = {
    sys: makeSysSettings(filePath, ext, params),
  };
  // console.log("SYS", vars.sys);

  const docproc = new DocProcessor({ vars });
  loadBaseAndExtendedPlugins(docproc, vars.sys);
  return docproc;
};

export const makeSysSettings = (
  filePath: string,
  ext: string,
  params?: CLIParams
): SysSettings => {
  const absPath = path.resolve(filePath);
  const fileContext = {
    dir: path.dirname(absPath),
    name: path.basename(absPath),
    path: absPath,
    ext,
  };

  // create file/dir context for settings
  const settingsContext = {
    settingsDir: params?.settingsDir ?? fileContext.dir,
    settingsName: params?.settingsName ?? DOCUMENT_SETTINGS_NAME,
  };

  // create settings from context
  const fileDir = path.dirname(filePath);
  const settings = getDocumentSettings(
    settingsContext.settingsDir,
    settingsContext.settingsName
  );

  return {
    doc: { ...fileContext, ...settingsContext, settings },
  };
};

export const loadBaseAndExtendedPlugins = (
  docproc: DocProcessor,
  settings: SysSettings
) => {
  const pm = getPluginManager();
  const docSet = settings.doc;
  const plugOpts = docSet.settings.pluginOptions;
  const plugins = SUPPORTED_EXTENSIONS[docSet.ext].plugins.concat(
    docSet.settings.plugins
  );
  // console.log("SYS.plugins", plugins);
  plugins.forEach(({ name, path }) => {
    // console.log("SYS.plugin register", { name, path });
    pm.registerFromModule(name, path);
    pm.attach(name, docproc, plugOpts[name]);
  });
};
