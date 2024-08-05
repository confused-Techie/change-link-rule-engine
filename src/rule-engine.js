const Conditions = require("./conditions.js");
const Target = require("./target.js");

module.exports =
class RuleEngine {
  constructor(rule, diffFileArray, opts) {
    this.rule = rule;
    this.diffFileArray = diffFileArray;
    this.opts = opts;

    this.responses = [];
  }

  run() {
    for (const diffFile of this.diffFileArray) {
      const ruleResults = this.handleRule(diffFile);

      this.responses.push({
        changed_file: diffFile,
        ...ruleResults
      });
    }
  }

  handleRule(diffFile) {
    // First lets setup our conditions
    const conditional = new Conditions(diffFile, this.rule.conditions);

    if (!conditional.run()) {
      // The conditional returned false, the conditions don't match this file array
      // we don't need to take any action
      return;
    }

    const actionResults = [];

    // Since our conditional passed, we move onto the actions we want to take.
    for (const action of this.rule.actions) {
      // Lets set up our action's targets
      const currentTarget = new Target({
        isPrevious: false,
        definition: action.target_current,
        commonAncestorCommit: this.opts.commonAncestorCommit
      });
      const previousTarget = new Target({
        isPrevious: true,
        definition: action.target_previous,
        commonAncestorCommit: this.opts.commonAncestorCommit
      });

      // With our targets setup, lets compare
      const comparison = this.compare(action.compare, currentTarget, previousTarget);

      actionResults.push({
        name: action.name,
        current_target_matches: currentTarget.matches,
        previous_target_matches: previousTarget.matches,
        comparison_results: comparison
      });
    }

    return actionResults;
  }

  compare(compareRule, currentTarget, previousTarget) {
    let comparisonResults = null;

    const currentData = currentTarget.getTarget();
    const previousData = previousTarget.getTarget();

    if (compareRule.check === "equals") {
      comparisonResults = this.compareEquals(currentData, previousData, compareRule.ok_conditions);
    } // other possible checks here

    // Return our results
    return comparisonResults;
  }

  compareEquals(currentData, previousData, okConditions) {
    // We have been given two arrays:
    // - currentData
    // - previousData
    // And any extra conditions that still means things are okay
    // We will compare every value between the arrays for equality with each other
    // if any one fails, we consider this a failure. If they all match, it's a success

    const results = [];

    for (const cur of currentData) {
      for (const prev of previousData) {
        if (cur instanceof Error) {
          if (okConditions.includes(cur.message)) {
            // the error should still be reported as a success
            results.push({
              result: true,
              current: cur.message,
              previous: prev,
              reason: "Current Target error marked as an ok condition"
            });
          } else {
            // This check has failed for some reason, may be a good idea to add
            // this as a response
            results.push({
              result: false,
              current: cur.message,
              previous: prev,
              reason: "Current Target Errored"
            });
          }
          continue;
        }
        if (prev instanceof Error) {
          if (okConditions.includes(cur.message)) {
            // The error should still be reported as a success
            results.push({
              result: true,
              current: cur,
              previous: prev.message,
              reason: "Previous Target error marked as an ok condition"
            });
          } else {
            // This check has failed for some reason, may be good to log
            results.push({
              result: false,
              current: cur,
              previous: prev.message,
              reason: "Previous Target Errored"
            });
          }
          continue;
        }

        results.push({
          result: cur == prev,
          current: cur,
          previous: prev,
          reason: ""
        });
      }
    }

    return results;
  }
}
