import {
  readJson,
  readlines,
  runCommand,
  log,
  appendFile,
} from "./util";
import type {
  Strategy,
  StrategyStep,
  StepResult,
  ExecuteRequest,
} from "./language";
import { mkdirp } from "fs-extra";
import { cmdLine } from "./argParse";
import { HostShell, DockerShell } from "./shell";
import type { Shell } from "./shell";

import { runInPool } from "./concurrency";
import path from "path";
import fs from "fs";
import os from "os";
import Ajv, { AnySchema } from "ajv";
import { validate } from "./dependencies";
import { ecoFind } from "./ecoFind";

const ECO_DIR = path.join("~", ".eco");
const BUILD_DIR = path.dirname(require.resolve("../package.json"));
const SANDBOX_DIR = path.join(ECO_DIR, "sandbox");

const ajv = new Ajv();
const schema = readJson(
   path.join(ECO_DIR.replace(/~/, os.homedir()), "strategies", "strategy-schema.json")
);
const validateSchema = ajv.compile(schema as AnySchema);

export interface StrategyRequest {
  // Where is the JSON file with the strategy located?
  strategyPath: string;
  // Where is the list of packages to analyze located?
  filesPath: string;
  // a list of packages
  filesList: string[];
  // cleanup the package sources
  cleanup: boolean;
  // the name of the directory where to store logs
  logDir: string;
  // number of packages to process in parallel
  cpus: number;
  // display the log on the console
  verbose: boolean;
}

export interface StrategyToRun {
  // Where are the files that we should analyze?
  packages: string[];
  // What is the strategy that we could execute?
  strategy: Strategy;
  // cleanup stage
  cleanup: boolean;
  // number of packages to process in parallel
  cpus: number;
  // display the log on the console
  verbose: boolean;
  // the log directory
  logDir: string;
}

const resolveRequest = (req: StrategyRequest): StrategyToRun => {
  const strategy = readJson(path.normalize(req.strategyPath)) as Strategy;
  const valid = validateSchema(strategy);
  if (!valid) {
    console.error(
      `Fatal errors while validating strategy: ${req.strategyPath}`
    );
    validateSchema?.errors?.forEach((mistake) => {
      console.dir(mistake, { depth: null, colors: !process.env["NO_COLOR"] });
    });
    process.exit(1);
  }
  const packages = req.filesPath 
     ? readlines(path.normalize(req.filesPath))
     : req.filesList;
     
  return { strategy, packages, cpus: req.cpus, cleanup: req.cleanup, verbose: req.verbose, logDir: req.logDir };
};

/*---------------------------------------------------------------------*/
/*    executeStep ...                                                  */
/*---------------------------------------------------------------------*/
async function executeStep(step: StrategyStep, req: ExecuteRequest, shell: Shell): Promise<StepResult> {
  const { cwd, defaultTimeout, logFile } = req;
  if ("run" in step) {
    const cmd = step.run
        .replace(/ [$]f/g, cmdLine.f)
        .replace(/ [$]n/g, cmdLine.n)
        .replace(/ [$]j/g, cmdLine.j)
        .replace(/ [$]d/g, cmdLine.d)
        .replace(/ [$]v/g, cmdLine.v)
	.replace(/ [$]path/g, cmdLine.path)
        .replace(/[$]lib/g, req.lib)
        .replace(/[$]sandbox/g, SANDBOX_DIR)
        .replace(/[$]eco/g, ECO_DIR)
        .replace(/[$]builddir/g, BUILD_DIR)
        .replace(/[$]strategy/g, req.strategyName)
        .replace(/[$]logfile/g, req.logFile)
	.replace(/~/g, shell.home)
    await appendFile(logFile, `run "${cmd} [${shell.constructor.name}]"\n`);
    const res = await runCommand({
      timeout: step.timeout || defaultTimeout,
      command: cmd,
      cwd: (("cwd" in step) && !step.cwd) ? shell.cwd() : cwd,
      outputFile: logFile,
    }, shell);
    return res;
  }
  switch (step.uses) {
    case "@eco/find": {
      return ecoFind(req, step, shell);
    }
  }
}

/*---------------------------------------------------------------------*/
/*    executeSteps ...                                                 */
/*---------------------------------------------------------------------*/
async function executeSteps(req: ExecuteRequest, shell: Shell, cleansh: boolean) {
  const { lib, steps, cleanup, logFile } = req;
  
  try {
    let sh = await shell.fork(lib);
  
    log(`Executing strategy for ${lib}`);

    // ensures that the log directory exists
    if (!fs.existsSync(path.dirname(req.logFile))) {
       await mkdirp(path.dirname(req.logFile));
       log(`log directory created ${path.dirname(req.logFile)}`);
    } else {
      // if it does remove existing log file
      if (fs.existsSync(req.logFile)) {
        log(`log file cleaned up ${req.logFile}`);
        fs.unlinkSync(req.logFile);
      }
    }

    try {
      for (const [i, step] of steps.entries()) {
        await appendFile(
          logFile,
          `\n### ECO:STEP ${i + 1}/${steps.length}: ${new Date().toISOString()} (${step.name})\n`
        );
        const res = await executeStep(step, req, sh);
        if (res !== "STEP_SUCCESS") {
          break;
        }
      }
    } catch (err:any) {
      log(`*** ECO-ERROR:step:toplevel error triggered by ${lib}\n${err.toString()}`);
      await appendFile(logFile, err.toString());
    } finally {
      for (const [i, step] of cleanup.entries()) {
        try {
          await appendFile(
            logFile,
            `\n### ECO:CLEANUP ${i + 1}/${cleanup.length}: ${new Date().toISOString()}\n`
          );
          await executeStep(step, req, sh);
          await appendFile(
            logFile,
            `eco:cleanup ${i + 1}/${cleanup.length} completed`
          );
        } catch (err) {
          log(`*** ECO-ERROR:cleanup:Error cleaning up ${lib}`);
        }
      }
      await appendFile(
        logFile,
        `eco:cleanup completed`);
    }
    
    if (req.verbose) {
      process.stdout.write(fs.readFileSync(logFile));
    }
    
    if (cleansh) {
      sh.cleanup();
    } 
    
    log(`Finished running strategy for ${lib}`);
  } catch (err:any) {
    log(`*** ECO-ERROR:fork:Cannot start the container for package ${lib}: ${err.toString()}`);
    return;
  }

}

/*---------------------------------------------------------------------*/
/*    execute ...                                                      */
/*---------------------------------------------------------------------*/
export async function execute(toRun: StrategyToRun, shell: Shell): Promise<void> {
  function executeLib(lib: string) {
    const unstartedWork = (): Promise<void> => {
      const logFile = 
         path.join(ECO_DIR, toRun.strategy.config.name, toRun.logDir, lib)
	    .replace(/~/g,os.homedir());
	    
      return executeSteps({
        lib,
        cleanup: toRun.cleanup ? toRun.strategy.action.cleanup || []: [],
        steps: toRun.strategy.action.steps,
        defaultTimeout: toRun.strategy.config.timeout,
        cwd: path.join(SANDBOX_DIR, lib),
        logFile,
	verbose: toRun.verbose,
	strategyName: toRun.strategy.config.name
      }, shell, toRun.cleanup);
    };
    return unstartedWork;
  }
  
  const tasks = toRun.packages.map(executeLib);
  await runInPool(toRun.cpus ,tasks);
}

/*---------------------------------------------------------------------*/
/*    interpret ...                                                    */
/*---------------------------------------------------------------------*/
export async function interpret(req: StrategyRequest) {
  const toRun = resolveRequest(req);
  const { strategy } = toRun;
  const docker = strategy.config.docker 
  const execshell = docker
    ? new DockerShell(docker.home, docker.dockerFile, docker.imageName, docker.incremental)
    : new HostShell();

  await execshell.init();
  
  await validate(strategy.config.dependencies, strategy.config.name);
  
  // const runPath = path.join(ECO_DIR, strategy.config.name, req.logDir);
  
  await execute(toRun, execshell);
}
