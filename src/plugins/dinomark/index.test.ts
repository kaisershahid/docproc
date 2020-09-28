import { expect } from "chai";
import { DocProcessor } from "../../doc-processor";
import doc = Mocha.reporters.doc;

describe.only("plugins.dinomark.Full Integration Testing", () => {
  const markdown = `# header 1
  
  maps.0.key = [][maps.0.key]
`;
  const vars = {
    maps: [{ key: "embedded value" }, { key: "e_v2.0" }],
  };
  const docproc = new DocProcessor({ vars });
  require("../markdown").registerPlugin(docproc);
  require("./index").registerPlugin(docproc);

  docproc.process(markdown);
  const html = docproc.toString();

  expect(html).to.contain("maps.0.key = embedded value");
  expect(html).to.contain("<h1> header 1</h1>", "parsed h1 not found");
});
