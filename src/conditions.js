const File = require("./file.js");

module.exports =
class Conditions {
  constructor(diffFilePath, rule) {
    this.diffFilePath = diffFilePath;
    this.rule = rule;
  }

  run() {
    // We will run through every provided condition, and reject if any fail.
    // Or return true if they all pass

    for (const prop in this.rule) {
      if (prop === "file") {
        if (!this.file(this.rule[prop])) {
          return false;
        }
      }
    }

    // All checks have passed
    return true;
  }

  file(fileRule) {
    // Check if the file property of the condition passes our current diff
    const fileCondition = new File(this.diffFilePath, fileRule);

    return fileCondition.run();
  }
}
