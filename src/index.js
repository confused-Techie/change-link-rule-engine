const RuleEngine = require("./rule-engine.js");
const git = require("./git.js");

module.exports =
function index(rules, opts) {
  const commonAncestorCommit = git.getCommonAncestor();
  const diffString = git.getDiff(commonAncestorCommit);
  const changedFilesArray = diffString.split("\n");

  if (opts.verbose) {
    console.log("Array of changed files between commits:");
    console.log(changedFilesArray);
  }

  // Track the responses to each rule
  const responses = [];

  for (const rule of rules) {
    const ruleEngine = new RuleEngine(rule, changedFilesArray, {
      commonAncestorCommit: commonAncestorCommit
    });

    ruleEngine.run();

    responses.push({
      rule: rule.name,
      responses: ruleEngine.responses
    });
  }

  // Handle our resolves
  if (rules.resolves.includes("log")) {
    console.log(responses);
  } // else other resolves

}
