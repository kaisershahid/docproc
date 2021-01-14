"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBaseAndExtendedPlugins = exports.makeSysSettings = exports.getDocProcForFile = exports.parseFilePath = exports.getDocumentSettings = exports.normalizeDocumentSettings = exports.DOCUMENT_SETTINGS_NAME = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const plugins_1 = require("../plugins");
const doc_processor_1 = require("../doc-processor");
exports.DOCUMENT_SETTINGS_NAME = ".docproc.json";
exports.normalizeDocumentSettings = (settings) => {
    const plugins = settings === null || settings === void 0 ? void 0 : settings.plugins;
    const pluginOptions = settings === null || settings === void 0 ? void 0 : settings.pluginOptions;
    const metadata = settings === null || settings === void 0 ? void 0 : settings.metadata;
    return {
        plugins: plugins !== null && plugins !== void 0 ? plugins : [],
        pluginOptions: pluginOptions !== null && pluginOptions !== void 0 ? pluginOptions : {},
        metadata: metadata !== null && metadata !== void 0 ? metadata : {},
    };
};
exports.getDocumentSettings = (dirPath, fileName) => {
    const path = `${dirPath !== null && dirPath !== void 0 ? dirPath : process.cwd()}/${fileName !== null && fileName !== void 0 ? fileName : exports.DOCUMENT_SETTINGS_NAME}`;
    if (fs_1.default.existsSync(path)) {
        return exports.normalizeDocumentSettings(JSON.parse(fs_1.default.readFileSync(path).toString()));
    }
    return exports.normalizeDocumentSettings({});
};
/**
 * Maps a file extension to its base DocumentSettings.
 */
const SUPPORTED_EXTENSIONS = {
    md: {
        pluginOptions: {},
        metadata: {},
        plugins: [
            { name: "markdown", path: `${__dirname}/../plugins/markdown` },
            { name: "dinomark", path: `${__dirname}/../plugins/dinomark` },
        ],
    },
};
exports.parseFilePath = (filePath) => {
    var _a;
    const parts = filePath.split("/");
    const baseName = parts.pop();
    const extParts = baseName.split(".");
    const ext = (_a = extParts.pop()) !== null && _a !== void 0 ? _a : "";
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
exports.getDocProcForFile = (filePath, params) => {
    const sourceContext = exports.parseFilePath(filePath);
    const { ext } = sourceContext;
    if (!SUPPORTED_EXTENSIONS[ext]) {
        throw new Error(`the extension '${ext}' is not supported`);
    }
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error(`'${filePath}' does not exist`);
    }
    const vars = {
        sys: exports.makeSysSettings(sourceContext, params),
    };
    // console.log("SYS", vars.sys);
    const docproc = new doc_processor_1.DocProcessor({ vars });
    exports.loadBaseAndExtendedPlugins(docproc, vars.sys);
    return { docproc, sourceContext };
};
exports.makeSysSettings = (sourceContext, params) => {
    var _a, _b;
    const { filePath, ext } = sourceContext;
    const absPath = path_1.default.resolve(filePath);
    // create file/dir context for settings
    const settingsContext = {
        settingsDir: (_a = params === null || params === void 0 ? void 0 : params.settingsDir) !== null && _a !== void 0 ? _a : sourceContext.basePath,
        settingsName: (_b = params === null || params === void 0 ? void 0 : params.settingsName) !== null && _b !== void 0 ? _b : exports.DOCUMENT_SETTINGS_NAME,
    };
    // create settings from context
    const fileDir = path_1.default.dirname(filePath);
    const settings = exports.getDocumentSettings(settingsContext.settingsDir, settingsContext.settingsName);
    return {
        doc: { ...sourceContext, ...settingsContext, settings },
    };
};
exports.loadBaseAndExtendedPlugins = (docproc, settings) => {
    const pm = plugins_1.getPluginManager();
    const docSet = settings.doc;
    const plugOpts = docSet.settings.pluginOptions;
    const plugins = SUPPORTED_EXTENSIONS[docSet.ext].plugins.concat(docSet.settings.plugins);
    // console.log("SYS.plugins", plugins);
    plugins.forEach(({ name, path }) => {
        // console.log("SYS.plugin register", { name, path });
        pm.registerFromModule(name, path);
        pm.attach(name, docproc, plugOpts[name]);
    });
};
