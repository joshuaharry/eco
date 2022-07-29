import { exec, spawn } from "child_process";
import { promisify } from "util";
export { mkdirp, rm } from "fs-extra";
export { appendFile } from "fs/promises";
import { readFileSync, createWriteStream } from "fs-extra";
import { setTimeout } from "timers/promises";
import treeKill from "tree-kill";
import type { OperationTimeout, StepResult } from "./language";
import { Writable } from "stream";
import { basename } from "path";

export const run = promisify(exec);

export const programExists = async (theProgram: string): Promise<boolean> =>
  run(`command -v ${theProgram}`)
    .then(() => true)
    .catch(() => false);

const quitFileError = (err: unknown, thePath: string): never => {
  // eslint-disable-next-line
  // @ts-ignore
  if (err.code === "ENOENT") {
    console.error(`Fatal error: could not find file ${thePath}`);
    process.exit(1);
  } else {
    console.error(`Fatal unexpected error`, err);
    process.exit(1);
  }
};

export const readlines = (filePath: string): string[] => {
  try {
    const theFile = readFileSync(filePath, { encoding: "utf-8" });
    return theFile.split("\n").filter((x) => x !== "");
  } catch (err) {
    return quitFileError(err, filePath);
  }
};

export const readJson = (filePath: string): unknown => {
  try {
    const res = readFileSync(filePath, { encoding: "utf8" });
    return JSON.parse(res);
  } catch (err) {
    return quitFileError(err, filePath);
  }
};

interface Command {
  cwd: string;
  outputFile: string;
  command: string;
  timeout: number;
  output?: string;
}

interface TimeoutOperation<T = unknown, U = unknown> {
  promise: Promise<T>;
  cancel: () => U;
  timeout: number;
}

const runTimeout = async <T>(
  op: TimeoutOperation<T>
): Promise<T | OperationTimeout> => {
  const { promise, cancel, timeout } = op;
  const timeoutCanceller = new AbortController();
  const timeoutPromise = setTimeout(timeout, "OPERATION_TIMEOUT", {
    signal: timeoutCanceller.signal,
  }).catch((err) => {
    if (err.code !== "ABORT_ERR") {
      throw err;
    }
  }) as Promise<StepResult>;
  const res = (await Promise.race([promise, timeoutPromise])) as
    | T
    | OperationTimeout;
  if (res === "OPERATION_TIMEOUT") {
    cancel();
  } else {
    timeoutCanceller.abort();
  }
  return res;
};

export const log = (message: string) => {
  console.log(`${new Date().toISOString()}: ${message}`);
};

function bufferWriteStream(buf: string[]): any {
   var writable = new Writable({
      write: function(chunk, encoding, next) {
         buf.push(chunk.toString(typeof encoding === "string" ? "ascii" : "ascii"));
    	 next();
      }
   });
   return writable;
}

export let commandResult: string | false = false;

export const runCommand = async (cmd: Command): Promise<StepResult> => {
  const { outputFile, command, timeout, cwd } = cmd;
  const buffer: string[] = [];
  commandResult = false;
  log(`$ ${command} (${cwd})`);
  const stream = (outputFile === "-" ? bufferWriteStream(buffer) : createWriteStream(outputFile, { flags: "a" }));
  const ongoingCommand = spawn(command, { shell: true, cwd });

  const runningCommand: Promise<StepResult> = new Promise((res) => {
    ongoingCommand.stdout.pipe(stream);
    ongoingCommand.stderr.pipe(stream);
    ongoingCommand.on("error", () => {
      // TODO: Handle these errors more correctly.
      log(`!!! error ${cwd}`);
    });
    ongoingCommand.on("close", (code) => {
      if (code === 0) {
         if (outputFile === "-") {
	   cmd.output = buffer.join();
         }
         res("STEP_SUCCESS");
      } else {
	 res("STEP_FAILURE");
      }
    });
  });

  const cancel = () => {
    try {
      treeKill(ongoingCommand.pid as number);
      // !!! MS 29jul2022, awful hack because I don't know to do it better
      // some packages, e.g. cls-hooked have bad npm test commands.
      // For this one, the test directive is:
      //   mocha test/*.js & tap test/tap/*.tap.js
      // because of this "&" a shell process is spawned in background and
      // happens to never ends. This prevents eco to end. 
      if (command.indexOf("npm test") >= 0) {
         log('!!! forcing "npm test" abort (' + cwd + ')...');
	 log("running (pid=`ps aux | grep node | grep sandbox/" + basename(cwd) + "| awk '{print $2}'`; kill -9 $pid)")
         exec("(pid=`ps aux | grep node | grep sandbox/" + basename(cwd) + " | awk '{print $2}'`; kill -9 $pid)");
      }
    } catch (err: any) {
      log("!!! treeKill error...");
      log(err.toString());
      // TODO: Handle problems here more gracefully.
    }
  };

  return runTimeout({ cancel, promise: runningCommand, timeout });
};
