const fs = require("fs");
const path = require("path");
const { globSync } = require("glob");
const { getFileContentsByCommit } = require("./git.js");

module.exports =
class Target {
  constructor(opts) {
    this.isPrevious = opts.isPrevious; // target_current || target_previous
    this.definition = opts.definition; // the defined target data
    this.commonAncestorCommit = opts.commonAncestorCommit; // the commit id of the last common ancestor

    this.matches;
  }

  // Returns whatever the intended target is
  getTarget() {
    const targets = [];

    this.matches = this.getPaths();

    for (const match of this.matches) {
      targets.push(this.getDataToCheck());
    }

    return targets;
  }

  // Returns the data intended to be checked. Modified by any specifiers
  getDataToCheck(match) {
    // Within this function if we cannot get the data, we return an error.
    // DO NOT THROW
    // The error will be pushed to our upstream targets array, and handled
    // during the final 'compare' evaluation
    let data;

    // === Handle `property`
    if (this.definition.property === "contents") {
      if (this.isPrevious) {
        // get the previous file contents
        data = getFileContentsByCommit(this.commonAncestorCommit, match);
      } else {
        // get the current file contents
        data = fs.readFileSync(match, { encoding: "utf8" });
      }
    } // other checks

    // === Handle `kind`
    if (this.definition.kind) {
      if (this.definition.kind === "keyValue") {
        const ext = path.extname(match);
        // now with the extension, lets see if we can turn it into an object
        if (ext === ".json") {
          data = JSON.parse(data);
        } // other supported extensions
      } // other kinds
    }

    // === Handle `value`
    if (this.definition.value) {
      // now we want to extract a value from the contents, depending on it's kind
      if (this.definition.kind === "keyValue") {
        data = data[this.definition.value];
      } // other kinds
    }

    return data;
  }

  // Returns an array of all possible path matches
  getPaths() {
    const definitionPath = this.definition.path;

    // TODO handle replacements
    return globSync(definitionPath);
  }
}
