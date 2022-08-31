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
import { HostShell, DockerShell } from "./shell";
import type { Shell } from "./shell";

import { runInPool } from "./concurrency";
import path from "path";
import os from "os";
import Ajv, { AnySchema } from "ajv";
import { validate } from "./dependencies";
import { ecoFind } from "./ecoFind";

const ECO_DIR = path.join("~", ".eco");
const SANDBOX_DIR = path.join("~", ".eco", "sandbox");

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
}

export interface StrategyToRun {
  // Where are the files that we should analyze?
  packages: string[];
  // What is the strategy that we could execute?
  strategy: Strategy;
  // cleanup stage
  cleanup: boolean;
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
  return { strategy, packages, cleanup: req.cleanup };
};

/*---------------------------------------------------------------------*/
/*    executeStep ...                                                  */
/*---------------------------------------------------------------------*/
async function executeStep(step: StrategyStep, req: ExecuteRequest, shell: Shell): Promise<StepResult> {
  const { cwd, defaultTimeout, logFile } = req;
  if ("run" in step) {
    const res = await runCommand({
      timeout: step.timeout || defaultTimeout,
      command: step.run,
      cwd: cwd,
      outputFile: logFile
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
  const { lib, steps, cleanup, logFile, cwd } = req;
  const sh = await shell.fork(lib);
  
  await sh.rm(cwd, { force: true, recursive: true });
  await sh.mkdirp(cwd);
  
  log(`Executing strategy for ${lib}`);
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
      } catch (err) {
        log(`*** ECO-ERROR:cleanup:Error cleaning up ${lib}`);
      }
    }
  }
  
  if (cleansh) {
    sh.cleanup();
  } 
  
  log(`Finished running strategy for ${lib}`);
}

/*---------------------------------------------------------------------*/
/*    execute ...                                                      */
/*---------------------------------------------------------------------*/
export async function execute(toRun: StrategyToRun, shell: Shell): Promise<void> {
  function executeLib(lib: string) {
    const unstartedWork = (): Promise<void> => {
      return executeSteps({
        lib,
        cleanup: toRun.cleanup ? toRun.strategy.action.cleanup : [],
        steps: toRun.strategy.action.steps,
        defaultTimeout: toRun.strategy.config.timeout,
        cwd: path.join(SANDBOX_DIR, lib),
        logFile: path.join(process.cwd(), lib),
      }, shell, toRun.cleanup);
    };
    return unstartedWork;
  }
  
  const tasks = toRun.packages.map(executeLib);
  await runInPool(os.cpus().length - 1, tasks);
}

/*---------------------------------------------------------------------*/
/*    interpret ...                                                    */
/*---------------------------------------------------------------------*/
export async function interpret(req: StrategyRequest) {
  const toRun = resolveRequest(req);
  const { strategy } = toRun;
  const docker = strategy.config.docker 
  const execshell = docker
    ? new DockerShell(docker.home, docker.dockerFile, docker.imageName)
    : new HostShell();
  const logshell = new HostShell();

  await execshell.init();
  await logshell.init();
  
  const logsh = await logshell.fork("log");
  await validate(strategy.config.dependencies);
  
  const runPath = path.join(ECO_DIR, strategy.config.name, req.logDir);
  await logsh.mkdirp(runPath);
  await logsh.chdir(runPath);
  
  if (req.cleanup) {
    await logsh.cleanup();
  }
  
  await execute(toRun, execshell);
}
