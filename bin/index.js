#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const cmdLineArgs = require("command-line-args");

const optsDef = [
  {
    name: "verbose", alias: "v", type: Boolean
  },
  {
    name: "ruleset", type: String, defaultOption: true
  }
];

const opts = cmdLineArgs(optsDef);

let ruleset;
const ext = path.extname(opts.ruleset);

if (ext === ".json") {
  ruleset = JSON.parse(
    fs.readFileSync(
      path.resolve(opts.ruleset),
      { encoding: "utf8" }
    )
  );
} else if (ext === ".js") {
  ruleset = require(path.resolve(opts.ruleset));
}

if (typeof ruleset !== "string") {
  console.error("No ruleset provided!");
  process.exit(1);
}

const changeLinkRE = require("../src/index.js");

changeLinkRE(ruleset, opts);
