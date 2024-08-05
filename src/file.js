const path = require("path");
const { globSync } = require("glob");

// Is able to determine if file rules match the provided diff file path
module.exports =
class File {
  constructor(diffFilePath, rule) {
    this.diffFilePath = diffFilePath;
    this.rule = rule;
  }

  run() {
    // To check if the file matches, we will iterate through every property
    // specified by the rule, if a single one fails, the file doesn't match.
    // If none fail, the file matches.

    for (const prop in this.rule) {
      if (prop === "extension") {
        if (!this.extension(this.rule[prop])) {
          return false;
        }
      } else if (prop === "not_extension") {
        // Here we fail if the file matches the directory
        if (this.extension(this.rule[prop])) {
          return false;
        }
      } else if (prop === "directory") {
        if (!this.directory(this.rule[prop])) {
          return false;
        }
      } else if (prop === "not_directory") {
        // Here we fail if the file matches the directory
        if (this.directory(this.rule[prop])) {
          return false;
        }
      }
    }

    return true;
  }

  // === Different Property Matches
  // Each will be passed the value it's expected to match against
  extension(wantExt) {
    const ext = path.extname(this.diffFilePath);

    return (ext === wantExt);
  }

  directory(dir) {
    const definedDir = dir;
    // TODO handle replacements

    const glob = globSync(definedDir);

    for (const file of glob) {
      if (path.resolve(file) === path.resolve(this.diffFilePath)) {
        return true;
      }
    }

    // If we get to the end and never matched, we know the filepath is not apart
    // of the glob we were given by the user
    return false;
  }
}
