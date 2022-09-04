import { exec, spawn } from "child_process";
import { promisify } from "util";
export { mkdirp, rm } from "fs-extra";
import { readFileSync, createWriteStream } from "fs-extra";
import { setTimeout } from "timers/promises";
import treeKill from "tree-kill";
import type { OperationTimeout, StepResult } from "./language";
import { Writable } from "stream";
import { basename } from "path";
import type { Shell } from "./shell";
import { appendFile } from "fs/promises";

interface SystemResult {
   code: number;
   stdout: string;
   stderr: string;
};

/*---------------------------------------------------------------------*/
/*    system ...                                                       */
/*    -------------------------------------------------------------    */
/*    Execute a command (inside a shell) and returns the process       */
/*    exit value. If "echo" is true, echos the output on the           */
/*    console.                                                         */
/*---------------------------------------------------------------------*/
export async function system(cmd: string, echo: boolean): Promise<SystemResult> {
   return new Promise((res, rej) => {
        const proc = spawn("sh", ["-c", cmd]);
	let stdout = "";
	let stderr = "";
	
        proc.stdout.on('data', (data) => {
          const buf = data.toString();
	  stdout += buf;
	  if (echo) process.stdout.write(buf);
	});
        proc.stderr.on('data', (data) => {
          const buf = data.toString();
	  stderr += buf;
	  if (echo) process.stderr.write(buf);
	});
	proc.on('close', (code: number) => 
          res({ code, stdout: stdout.trim(), stderr: stderr.trim() }));
   });
}

export const run = promisify(exec);

export const programExists = async (theProgram: string): Promise<boolean> =>
  run(`command -v ${theProgram}`)
    .then(() => true)
    .catch(() => false);

const quitFileError = (err: unknown, thePath: string): never => {
  // eslint-disable-next-line
  // @ts-ignore
  if (err.code === "ENOENT") {
    console.error(`ECO Fatal error: could not find file ${thePath}`);
    process.exit(1);
  } else {
    console.error(`ECO Fatal unexpected error`, err);
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
  cmd: Command;
}

export const log = (message: string) => {
  console.log(`${new Date().toISOString()}: ${message}`);
};

const runTimeout = async <T>(
  op: TimeoutOperation<T>
): Promise<T | OperationTimeout> => {
  const { promise, cancel, timeout, cmd } = op;
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
    await appendFile(cmd.outputFile, `\n### ECO:TIMEOUT ${cmd.command} ${cmd.cwd}\n`);
    log(`### ECO:TIMEOUT ${cmd.command} ${cmd.cwd}`);
    cancel();
  } else {
    timeoutCanceller.abort();
  }
  return res;
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

/*---------------------------------------------------------------------*/
/*    runCommand ...                                                   */
/*---------------------------------------------------------------------*/
export async function runCommand(cmd: Command, shell: Shell): Promise<StepResult> {
  const { outputFile, timeout } = cmd;
  const cwd = cmd.cwd.replace(/~/,shell.home);
  const command = cmd.command.replace(/~/,shell.home);
  const buffer: string[] = [];
  commandResult = false;

  const stream = (outputFile === "-" ? bufferWriteStream(buffer) : createWriteStream(outputFile, { flags: "a" }));
  const ongoingCommand = shell.spawn(command, { shell: true, cwd });

  const runningCommand: Promise<StepResult> = new Promise((res) => {
    ongoingCommand.stdout.pipe(stream);
    ongoingCommand.stderr.pipe(stream);
    ongoingCommand.on("error", (e) => {
      // TODO: Handle these errors more correctly.
      log(`[runCommand] error running "${command}" in "${cwd}"`);
      log(`[runCommand] ${e.toString()}`);
    });
    ongoingCommand.on("close", (code:number) => {
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

      // MS 29jul2022, for closing subprocess pipe
      ongoingCommand.stdout.destroy();
      ongoingCommand.stderr.destroy();
      ongoingCommand.stdin.destroy();
      ongoingCommand.unref();
      
      // !!! MS 29jul2022, awful hack because I don't know to do it better
      // some packages, e.g. cls-hooked have bad npm test commands.
      // For this one, the test directive is:
      //   mocha test/*.js & tap test/tap/*.tap.js
      // because of this "&" a shell process is spawned in background and
      // happens to never ends. This prevents eco to end. 
      if (command.indexOf("npm test") >= 0) {
         log('!!! forcing "npm test" abort (' + cwd + ')...');
	 log("running (pid=`ps aux | grep node | grep sandbox/" + basename(cwd) + "| awk '{print $2}'`; [ \"$pir \" != \" \" ] && kill -9 $pid)")
         exec("(pid=`ps aux | grep node | grep sandbox/" + basename(cwd) + " | awk '{print $2}'`; [ \"$pir \" != \" \" ] && kill -9 $pid)");
	 log("running (pid=`ps aux | grep flow | grep sandbox/" + basename(cwd) + "| awk '{print $2}'`; [ \"$pir \" != \" \" ] && kill -9 $pid)")
         exec("(pid=`ps aux | grep flow | grep sandbox/" + basename(cwd) + " | awk '{print $2}'`; [ \"$pir \" != \" \" ] && kill -9 $pid)");
      }
    } catch (err: any) {
      log("!!! treeKill error...");
      log(err.toString());
      // TODO: Handle problems here more gracefully.
    }
  };

  return runTimeout({ cancel, promise: runningCommand, timeout, cmd });
};
