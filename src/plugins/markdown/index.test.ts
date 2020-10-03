import fs from "fs";
import { expect } from "chai";
import { DocProcessor } from "../../doc-processor";
import { registerPlugin } from "./index";
import cheerio from "cheerio";

const getMarkdown = (name: string): string => {
  return fs.readFileSync(`${__dirname}/__test/${name}.md`).toString();
};

describe("plugins.markdown.Full Integration Test", () => {
  let subject = new DocProcessor();
  registerPlugin(subject);

  beforeEach(() => {
    subject = new DocProcessor(subject.makeContext());
  });

  it("parses links and link refs", () => {
    subject.process(getMarkdown("links-refs"));
    const html = subject.toString();
    expect(html).to.contain(
      `href="http://link1.url"`,
      "url-style link did not parse"
    );
    expect(html).to.contain(
      `href="http://link1.ref"`,
      "ref-style link did not parse"
    );
    expect(html).to.contain(
      "[bad link] is ignored.",
      "broken link did not render as source input"
    );
  });

  it("parses table", () => {
    subject.process(getMarkdown("tables"));
    const html = subject.toString();
    const expectedFragments = [
      "<th>header1 </th>",
      "<th><i>header2_ </i></th>", // @todo fix this!
      "<th><strong>header3</strong></th>",
      "<td>row1.1  </td>",
      "<td><code>row1.2</code>  </td>",
      "<td><del>row1.3</del></td>",
    ];

    expectedFragments.forEach((fragment) => {
      expect(html).to.contain(fragment);
    });
  });

  it("parses blockquote with nested structures", () => {
    subject.process(getMarkdown("blockquotes"));
    const html = subject.toString();
    const root = cheerio.load(html);
    const nestedP = root("blockquote p");
    const nestedBq = root("blockquote blockquote");
    expect(nestedP.html()).to.equal("intro para");
    expect(nestedBq.html()).to.equal("<p>nested quote</p>");
    const htmlTable = root("blockquote table").html();
    expect(htmlTable).to.contain("<th>col1</th><th>col2</th>");
    expect(htmlTable).to.contain("<td>r1.1</td><td>r1.2</td>");
  });

  it("parses code with ``` and nested in blockquote", () => {
    subject.process(getMarkdown("codes"));
    const html = subject.toString();
    const root = cheerio.load(html);
    expect(root("pre").html()).to.contain("code block 1");
    expect(root("blockquote pre").html()).to.contain(
      "code block 2.1\ncode block 2.2"
    );
  });

  it("parses ordered and unordered list items", () => {
    subject.process(getMarkdown("lists"));
    const html = subject.toString();
    const root = cheerio.load(html);
    expect(root("ul > li").html()).to.contain("<p>unordered 1</p>");
    expect(root("ul ol").html()).to.contain(
      "<li><p>ordered 1</p></li>\n<li><p>ordered 2</p></li>"
    );
  });
});
