# The How

This document details the initial details and ideas on how the Rule Engine functions.

For each rule it has it's required properties:

* name: The human friendly name of the rule.
* conditions: An array of conditions, which if all resolved, or truthy, then we take our action.
* actions: An array of actions that should be taken if all conditions are true.
* resolves: An array of steps that should be taken if the actions weren't taken already.

A good way to think of it is:

The `conditions` define things that could happen that we care about.
The `actions` define what steps **should** have been taken if a thing that we care about happened. If the `actions` have already happened, that means we don't have to do anything to fix it. The rule engine will only alert if the `actions` haven't been taken, when triggered by the `conditions`.
If the `actions` haven't been taken then the rule engine triggers the `resolves` to resolve the issue.

For example, if you want the registry key to match between the installer and uninstaller.
The `conditions` would check if the registry key has been changed in it's file.
If it has been changed we check the `actions` that have also been taken, here our `actions` should define the uninstaller registry key having also been changed, matching that of the new key. If the keys match nothing else needs to be done. But if they haven't, we then trigger our `resolves` to remediate the issue. Such as alerting the developer that the key needs to also be changed in the uninstaller script.

---

When checking our `conditions` we will iterate through every single changed file. Each file is uniquely compared against our conditions. If any one file matches a condition, then we trigger the process above.

## Conditions

A condition is made up of several property checks, that are run against a singular changed file.
Such as it's extension, or it's content, the directory it's in, or the inverse of these things.

In the future it'd be awesome to give each condition an `id` and the array of conditions would provide a way to define a relationship between them. Such as being able to say this or that, between two conditions. This would allow complex logic gates.

### Conditions Properties:

* file: Any conditions that relate the file in the current iteration from the diff.
  - extension: The extension of the changed file.
  - directory: A glob of the file location on disk.
  - not_directory: A glob not containing the file location on disk.

## Actions

While an action array can define a whole host of changes that need to be made, they are processed in a vacuum. Meaning there is no relationship between them.

Each action is expected to have a `target`, this defines the target file that we expect to have also changed.
Additionally, each action must have a `compare` property, this defines how the file should have been changed as a result of the action.

### Actions Properties:

* target: The target of what we want to check for a related action.
  - path: The glob path of the file based target. **Can only match a single file**
  - property: What we want to check of the file we matched.
    * `property: "contents"`: Indicates we want to check the file's contents.
  - kind: The type of data within the check we want to consider.
    * `kind: "keyValue"`: Indicates the data we want to check is one of key value pairs. This directs the rule engine to attempt to turn the file into an object based on it's file type.
  - value: The value within our target to match. The way the value is handled depends on the kind of file we are matching.
    * `kind: "keyValue"`: Since the file is a property store, the value will be handled as a property within the property store.
* compare: Defines how we want to compare the target data against the new dataset.
  - check: The type of check to execute between the current and previous targets.
  - ok_conditions: An array of conditions that could occur, that still allows the action to be considered passed.
