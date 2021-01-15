import { loadPluginsForExt } from "./plugins/index";
import { DocProcessor } from "./doc-processor";

export const getMarkdownInstance = (): DocProcessor => {
	const docproc = new DocProcessor();
	loadPluginsForExt({ docproc, ext: "md" });
	return docproc;
};

export default DocProcessor;
