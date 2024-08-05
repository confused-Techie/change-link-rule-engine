# Change-Link Rule Engine

The goal of this application is to provide a rule engine to define links, and alert when they are changed.
The intent is to prevent breaking changes or deviations within tangling cross-cutting concerns.

For Example:

Your application is distributed on Windows systems, and contains an installer, and uninstaller.
Within the installer you add a custom value to the Windows registry. In your uninstaller you have code that removes this custom registry item.

What happens if in the future you change the name of this key, without updating it in the uninstaller? The registry key cannot be cleanly decomposed from the `NSH` script running the installer, nor is this something easy to test for.
But with `change-link-rule-engine` you can define a link between the registry key in the installer, and uninstaller. So that when one is changed, the other must be too, otherwise you'll be alerted.

## Example Rules

```js
// This rule checks if a file with the `.wasm` extension that's not in `vendor/web-tree-sitter` has changed
// in our last diff.
// If it has, it defines current target by path, getting it's contents as a `keyValue`
// object store, checking the property `grammar`.
// It also defines the previous target identically to the current target.
// The comparison checks that these two values are equal.
// But if the previous file or property does not exist, the action is still considered passed.
module.exports = [
  {
    name: "Update parser source if wasm file updated",
    conditions: {
      file: {
        extension: ".wasm",
        not_directory: "vendor/web-tree-sitter"
      }
    },
    actions: [
      {
        name: "Ensure the grammar value is equal",
        target_current: {
          path: "$changedDirectory/../*.cson",
          property: "contents",
          kind: "keyValue",
          value: "grammar"
        },
        target_previous: {
          path: "$changedDirectory/../*.cson",
          check: "contents",
          kind: "keyValue",
          value: "grammar"
        },
        compare: {
          check: "equals",
          ok_conditions: [ "previous_not_exist" ]
        }
      }
    ],
    resolves: [
      "log"
    ]
  }
];
```
