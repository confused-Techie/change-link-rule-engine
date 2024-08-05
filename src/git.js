const cp = require("node:child_process");

function didError(cmd) {
  if (cmd.status !== 0 || cmd.stderr.toString().length > 0) {
    return true;
  } else {
    return false;
  }
}

function getFileContentsByCommit(commit, file) {
  const cmd = cp.spawnSync("git", [ "show", `${commit}:./${file}` ]);

  if (didError(cmd)) {
    // This can fail for two reasons we care about
    // 1. Any generic error
    // 2. This is a new file, and it failed to find an earlier copy (which didn't exist)
    if (cmd.stderr.toString().includes("exists on disk, but not in")) {
      return new Error("previous_not_exist");
    }
    // The error was something else
    return new Error(`Unhandled Error: '${cmd.stderr.toString()}'`);
  }

  return cmd.stdout.toString();
}

// Returns the last common ancestor commit sha between the current branch, and the master
function getCommonAncestor() {
  const cmd = cp.spawnSync("git", [ "merge-base", "origin/master", "HEAD^" ]);

  if (didError(cmd)) {
    console.error("Git command has failed! 'git merge-base origin/master HEAD^'");
    console.error(cmd.stderr.toString());
    throw cmd.stderr.toString();
    process.exit(1);
  }

  return cmd.stdout.toString().trim();
}

// Returns the files changed since 'commit'
function getDiff(commit) {
  const cmd = cp.spawnSync("git", [ "diff", "--name-only", "-r", "HEAD", commit ]);

  if (didError(cmd)) {
    console.error(`Git command has failed! 'git diff --name-only -r HEAD ${commit}'`);
    console.error(cmd.stderr.toString());
    throw cmd.stderr.toString();
    process.exit(1);
  }

  return cmd.stdout.toString().trim();
}

module.exports = {
  getFileContentsByCommit,
  getCommonAncestor,
  getDiff
};
