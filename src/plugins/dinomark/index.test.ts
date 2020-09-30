import { expect } from "chai";
import { DocProcessor } from "../../doc-processor";
import doc = Mocha.reporters.doc;

describe("plugins.dinomark.Full Integration Testing", () => {
  const markdown = `# header 1
  
[@var]: newmap (json:{"key": 0, "key2": 2})
[@var]: newmap.key (5)
[@include-var]: __test/test.json

newmap.key = [][newmap.key], newmap.key2 = [][newmap.key2],
maps.0.key = [][page.maps.0.key]

these two includes should preserve the whitespaces between files.

[@include]: __test/include1.md
[@include]: __test/include2.md

[@process]: __test/include2.md

[@execute]: __test/include.js
`;
  const vars = {
    sys: {
      sourceRoot: __dirname,
    },
  };
  const docproc = new DocProcessor({ vars });
  require("../markdown").registerPlugin(docproc);
  require("./index").registerPlugin(docproc);

  docproc.process(markdown);
  const html = docproc.toString();

  it("processes @var and @include-var and outputs variable reference", () => {
    expect(html).to.contain("newmap.key = 5");
    expect(html).to.contain("newmap.key2 = 2");
    expect(html).to.contain("maps.0.key = 5");
    expect(html).to.contain("<h1> header 1</h1>", "parsed h1 not found");
  });

  it("processes @include", () => {
    expect(html).to.contain("include 1 include 2 **bold**");
  });

  it("processes @process (markdown default)", () => {
    expect(html).to.contain("<p>include 2 <strong>bold</strong></p>");
  });

  it("processes @execute", () => {
    expect(html).to.contain("\nlook at me executing\n");
  });
});
