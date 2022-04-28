import { run, mkdirp, readlines } from "./util";
import { randomUUID } from "crypto";
import path from "path";
import os from "os";

export interface StrategyRequest {
  // Where is the JSON file with the strategy located?
  strategyPath: string;
  // Where is the list of packages to analyze located?
  filesPath: string;
}

export const interpret = async (req: StrategyRequest) => {
  return req;
};
