import { ArgumentParser } from "argparse";
import { version } from "../../package.json";

const parser = new ArgumentParser({
  description: "DOCument PROCessor",
});

parser.add_argument("-v", "--version", { action: "version", version });
parser.add_argument("-od", "--output-dir");
parser.add_argument("-o", "--output", {});
parser.add_argument("input");

export default parser;
