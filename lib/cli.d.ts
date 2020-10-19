import { DocumentSettings, SourcePathContext, SysSettings } from "./types";
import { DocProcessor } from "./doc-processor";
export declare const DOCUMENT_SETTINGS_NAME = ".docproc.json";
export declare type CLIParams = {
    settingsDir?: string;
    settingsName?: string;
};
export declare const normalizeDocumentSettings: (settings: any) => DocumentSettings;
export declare const getDocumentSettings: (dirPath?: string | undefined, fileName?: string | undefined) => DocumentSettings;
export declare const parseFilePath: (filePath: string) => SourcePathContext;
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
export declare const getDocProcForFile: (filePath: string, params?: CLIParams | undefined) => {
    docproc: DocProcessor;
    sourceContext: SourcePathContext;
};
export declare const makeSysSettings: (sourceContext: SourcePathContext, params?: CLIParams | undefined) => SysSettings;
export declare const loadBaseAndExtendedPlugins: (docproc: DocProcessor, settings: SysSettings) => void;
