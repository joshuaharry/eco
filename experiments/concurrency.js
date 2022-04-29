/**
 * Use the code in this file to play around with complicated node behavior
 * and the event loop. 
 */

const { createWriteStream } = require("fs");
const { spawn } = require("child_process");
const { setTimeout } = require("timers/promises");
const treeKill = require("tree-kill");

// interface Command {
//   outputFile: string;
//   command: string;
//   timeout: number;
// }

// interface Result {
//   exitCode: number | null;
//   reason: string;
// }
//
// type RaceResult = 'STEP_SUCCESS' | 'STEP_FAILURE' | 'STEP_TIMEOUT';

/**
 * Beware: This function is complicated and fragile.
 * 
 * Here's our wishlist of things to do:
 * 1. Run a shell command.
 * 2. Stream its output to a file.
 * 3. Exit when command has finished OR abort on a timeout.
 *
 * Unfortunately, there's a catch: The Node.js event loop! Just resolving our 
 * promises isn't enough - we have to manually cancel the timeout *or* kill the
 * shell and its subprocesses in order to clean up properly.
 */

const runCommand = async (cmd) => {
  const { outputFile, command, timeout } = cmd;

  const stream = createWriteStream(outputFile, { flags: "a" });
  const ongoingCommand = spawn(command, { shell: true });

  const runningCommand = new Promise((res, rej) => {
    ongoingCommand.stdout.pipe(stream);
    ongoingCommand.stderr.pipe(stream);
    ongoingCommand.on("error", (err) => {
      rej(err);
    });
    ongoingCommand.on("close", (code) => {
      res(code === 0 ? 'STEP_SUCCESS' : "STEP_FAILURE");
    });
  });

  const timeoutCanceller = new AbortController();
  const promise = setTimeout(timeout, "STEP_TIMEOUT", {
    signal: timeoutCanceller.signal,
  }).catch((err) => {
    if (err.code !== "ABORT_ERR") {
      throw err;
    }
  });

  const res = await Promise.race([runningCommand, promise]);
  if (res === "STEP_TIMEOUT") {
    stream.close();
    treeKill(ongoingCommand.pid);
  } else {
    timeoutCanceller.abort();
  }
  return res;
};

const main = async () => {
  return runCommand({
    outputFile: "output.log",
    command: "exit 0",
    timeout: 1000,
  });
};

main()
  .then((out) => console.log(out))
  .catch((err) => console.log(err));
