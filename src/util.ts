import { exec, spawn } from "child_process";
import { promisify } from "util";
export { mkdirp } from "fs-extra";
import { readFileSync, createWriteStream } from "fs-extra";
import { setTimeout } from "timers/promises";
import treeKill from "tree-kill";

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
  outputFile: string;
  command: string;
  timeout: number;
}

type OperationTimeout = "OPERATION_TIMEOUT";

type RaceResult = "STEP_SUCCESS" | "STEP_FAILURE" | OperationTimeout;

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
  }) as Promise<RaceResult>;
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

export const runCommand = async (cmd: Command): Promise<RaceResult> => {
  const { outputFile, command, timeout } = cmd;

  const stream = createWriteStream(outputFile, { flags: "a" });
  const ongoingCommand = spawn(command, { shell: true });

  const runningCommand: Promise<RaceResult> = new Promise((res, rej) => {
    ongoingCommand.stdout.pipe(stream);
    ongoingCommand.stderr.pipe(stream);
    ongoingCommand.on("error", (err) => {
      rej(err);
    });
    ongoingCommand.on("close", (code) => {
      res(code === 0 ? "STEP_SUCCESS" : "STEP_FAILURE");
    });
  });

  const cancel = () => {
    stream.close();
    treeKill(ongoingCommand.pid as number);
  };

  return runTimeout({ cancel, promise: runningCommand, timeout });
};
