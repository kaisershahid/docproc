import { expect } from "chai";
import { DinoBlockHandler } from "./block";
import { DocProcessor } from "../../doc-processor";
import {
  DINOMARK_SERVICE_DIRECTIVE,
  DirectiveDefinition,
  DirectiveHandler,
  DirectivesManager,
} from "./directives";
import {
  BlockActions,
  BlockHandlerType,
  DocProcContext,
  HandlerInterface,
} from "../../types";
import {
  BlockDecorationWrapper,
  BlocksListWrapper,
} from "../../defaults/block-wrappers";
import exp = require("constants");

describe("plugins.dinomark.block", () => {
  describe("DinoBlockHandler", () => {
    it('extracts [@directive]: text-value ("string")', () => {
      const subject = new DinoBlockHandler();
      [
        "[@",
        "directive",
        "]",
        ":",
        " ",
        "text-value",
        " ",
        "(",
        '"',
        "string",
        '"',
        ")",
        "\n",
        "\n",
      ].forEach((t) => subject.push(t));
      subject.handlerEnd();
      expect(subject.directives[0]).to.deep.equal({
        directive: "directive",
        action: "text-value",
        parameters: '"string"',
      });
    });

    it("yields to DirectiveHandler.modifyBlocks", () => {
      const docproc = new DocProcessor();
      const context = docproc.makeContext();
      const dman = new DirectivesManager();
      context.pluginServicesManager.addService(
        "dinomark",
        DINOMARK_SERVICE_DIRECTIVE,
        dman
      );

      // this will wrap the previous block with some decorators
      const blocksModifier: DirectiveHandler = {
        invokeDirective(def: DirectiveDefinition, ctx: DocProcContext): any {},
        modifyBlocks(
          blocks: HandlerInterface<BlockHandlerType>[],
          def,
          context
        ): HandlerInterface<BlockHandlerType>[] {
          const lastBlock = blocks.pop();
          return [...blocks, new BlockDecorationWrapper(lastBlock, ">", "<")];
        },
      };

      // map the directiv to the handler
      const def = { directive: "test", action: "t" };
      dman.addHandler(blocksModifier, def);

      const subject = new DinoBlockHandler();
      subject.setContext(context);

      const actions = [
        "[@",
        def.directive,
        "]",
        ":",
        " ",
        def.action,
        "\n",
      ].map((t) => subject.push(t));
      expect(actions.pop()).to.equal(
        BlockActions.REORDER,
        "test directive should have signaled REORDER"
      );

      const blocks = ["a", "b"];
      const newBlocks = subject.modifyBlocks(([
        ...blocks,
      ] as unknown) as HandlerInterface<BlockHandlerType>[]);

      expect(newBlocks[0]).to.equal("a");
      expect(newBlocks[1].toString()).to.equal(">b<");
    });
  });
});
