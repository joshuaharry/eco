import { readJson, readlines } from "./util";
import type { Strategy } from "./language";
// import { randomUUID } from "crypto";
import path from "path";
import os from "os";
import Ajv, { AnySchema } from "ajv";
import { validate } from "./dependencies";

const ajv = new Ajv();
const schema = readJson(
  path.join(os.homedir(), ".eco", "strategies", "strategy-schema.json")
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

export const interpret = async (req: StrategyRequest) => {
  const { strategy } = resolveRequest(req);
  await validate(strategy.config.dependencies);
};
