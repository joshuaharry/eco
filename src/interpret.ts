import {
  readJson,
  readlines,
  mkdirp,
  runCommand,
  log,
  appendFile,
  rm
} from "./util";
import type {
  Strategy,
  DockerConfig,
  StrategyStep,
  StepResult,
  ExecuteRequest,
} from "./language";
import { dockerInit } from "./docker";

import { runInPool } from "./concurrency";
import path from "path";
import os from "os";
import Ajv, { AnySchema } from "ajv";
import { validate } from "./dependencies";
import { ecoFind } from "./ecoFind";

const ECO_DIR = path.join(os.homedir(), ".eco");

const SANDBOX_DIR = path.join(os.homedir(), ".eco", "sandbox");

const ajv = new Ajv();
const schema = readJson(
  path.join(ECO_DIR, "strategies", "strategy-schema.json")
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

const executeStep = async (
  step: StrategyStep,
  req: ExecuteRequest,
  docker: DockerConfig | undefined
): Promise<StepResult> => {
  const { cwd, defaultTimeout, logFile } = req;
  if ("run" in step) {
    const res = await runCommand({
      timeout: step.timeout || defaultTimeout,
      command: step.run,
      cwd,
      outputFile: logFile,
    }, docker);
    return res;
  }
  switch (step.uses) {
    case "@eco/find": {
      return ecoFind(req, step, docker);
    }
  }
};

const executeSteps = async (req: ExecuteRequest, docker: DockerConfig | undefined) => {
  const { lib, steps, cleanup, logFile, cwd } = req;
  await rm(cwd, { force: true, recursive: true });
  await mkdirp(cwd);
  log(`Executing strategy for ${lib}`);
  try {
    for (const [i, step] of steps.entries()) {
      await appendFile(
        logFile,
        `\n### ECO:STEP ${i + 1}/${steps.length}: ${new Date().toISOString()} (${step.name})\n`
      );
      const res = await executeStep(step, req, docker);
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
        await executeStep(step, req, docker);
      } catch (err) {
        log(`*** ECO-ERROR:cleanup:Error cleaning up ${lib}`);
      }
    }
  }
  log(`Finished running strategy for ${lib}`);
};

const dockerExecuteSteps = async (req: ExecuteRequest, toRun: StrategyToRun) => {
  const docker = toRun.strategy.config.docker;
  if (docker) {
    console.log(">>> docker");
  }
  await executeSteps(req, docker);
  if (docker) {
    console.log("<<< docker");
    if (toRun.cleanup) {
       // remove the docker container we have just created 
    }
  }
}

export const toValidUnixName = (lib: string): string => {
  return lib.replace("/", "-");
};

/*---------------------------------------------------------------------*/
/*    execute ...                                                      */
/*---------------------------------------------------------------------*/
export async function execute(toRun: StrategyToRun): Promise<void> {
  const tasks = toRun.packages.map((lib) => {
    const unstartedWork = (): Promise<void> => {
      return dockerExecuteSteps({
        lib,
        cleanup: toRun.cleanup ? toRun.strategy.action.cleanup : [],
        steps: toRun.strategy.action.steps,
        defaultTimeout: toRun.strategy.config.timeout,
        cwd: path.join(SANDBOX_DIR, lib),
        logFile: path.join(process.cwd(), lib),
      }, toRun);
    };
    return unstartedWork;
  });
  await runInPool(os.cpus().length - 1, tasks);
}

/*---------------------------------------------------------------------*/
/*    interpret ...                                                    */
/*---------------------------------------------------------------------*/
export async function interpret(req: StrategyRequest) {
  const toRun = resolveRequest(req);
  const { strategy } = toRun;
  await dockerInit(strategy.config.docker);
  await validate(strategy.config.dependencies);
  const runPath = path.join(ECO_DIR, strategy.config.name, req.logDir);
  await mkdirp(runPath);
  process.chdir(runPath);
  await execute(toRun);
}
