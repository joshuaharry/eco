import {
  readJson,
  readlines,
  mkdirp,
  runCommand,
  log,
  appendFile,
  rm,
} from "./util";
import type {
  Strategy,
  StrategyStep,
  StepResult,
  ExecuteRequest,
} from "./language";
import { runInPool } from "./concurrency";
import path from "path";
import os from "os";
import Ajv, { AnySchema } from "ajv";
import { validate } from "./dependencies";
import ecoFind from "./ecoFind";

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
}

export interface StrategyToRun {
  // Where are the files that we should analyze?
  packages: string[];
  // What is the strategy that we could execute?
  strategy: Strategy;
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
  const packages = readlines(path.normalize(req.filesPath));
  return { strategy, packages };
};

const executeStep = async (
  step: StrategyStep,
  req: ExecuteRequest
): Promise<StepResult> => {
  const { cwd, defaultTimeout, logFile } = req;
  if ("run" in step) {
    const res = await runCommand({
      timeout: step.timeout || defaultTimeout,
      command: step.run,
      cwd,
      outputFile: logFile,
    });
    return res;
  }
  switch (step.uses) {
    case "@eco/find": {
      return ecoFind(req, step);
    }
  }
};

const executeSteps = async (req: ExecuteRequest) => {
  const { lib, steps, cleanup, logFile, cwd } = req;
  await rm(cwd, { force: true, recursive: true });
  await mkdirp(cwd);
  log(`Executing strategy for ${lib}`);
  try {
    for (const [i, step] of steps.entries()) {
      await appendFile(
        logFile,
        `${new Date().toISOString()}: ${step.name} - ${i + 1}/${
          steps.length
        }\n-----------------\n`
      );
      await executeStep(step, req);
    }
  } finally {
    for (const [i, step] of cleanup.entries()) {
      await appendFile(
        logFile,
        `${new Date().toISOString()}: ${step.name} - ${i + 1}/${
          cleanup.length
        }\n-----------------\n`
      );
      await executeStep(step, req);
    }
  }
  log(`Finished running strategy for ${lib}`);
};

export const execute = async (toRun: StrategyToRun): Promise<void> => {
  const tasks = toRun.packages.map((lib) => {
    const unstartedWork = (): Promise<void> => {
      return executeSteps({
        lib,
        cleanup: toRun.strategy.action.cleanup,
        steps: toRun.strategy.action.steps,
        defaultTimeout: toRun.strategy.config.timeout,
        cwd: path.join(SANDBOX_DIR, lib),
        logFile: path.join(process.cwd(), lib),
      });
    };
    return unstartedWork;
  });
  await runInPool(os.cpus().length - 1, tasks);
};

export const interpret = async (req: StrategyRequest) => {
  const toRun = resolveRequest(req);
  const { strategy } = toRun;
  await validate(strategy.config.dependencies);
  const startTime = new Date().toISOString();
  const runPath = path.join(ECO_DIR, strategy.config.name, startTime);
  await mkdirp(runPath);
  process.chdir(runPath);
  await execute(toRun);
};
