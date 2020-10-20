"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const argparse_1 = require("argparse");
const package_json_1 = require("../../package.json");
const parser = new argparse_1.ArgumentParser({
    description: "DOCument PROCessor",
});
parser.add_argument("-v", "--version", { action: "version", version: package_json_1.version });
parser.add_argument("-od", "--output-dir");
parser.add_argument("-o", "--output", {});
parser.add_argument("input");
exports.default = parser;
