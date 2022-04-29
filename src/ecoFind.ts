import type { EcoFind, ExecuteRequest, StepResult } from "./language";
import { appendFile, runCommand } from "./util";
import axios from "axios";

const ecosystemFetchers: Record<
  string,
  (req: ExecuteRequest, find: EcoFind) => Promise<string>
> = {
  async git(req) {
    return req.lib;
  },
  async npm(req, find) {
    const search = `http://registry.npmjs.com/-/v1/search?text=${req.lib}&size=1`;
    const { data } = await axios.get(search, {
      timeout: find.timeout || req.defaultTimeout,
    });
    const { repository } = data.objects[0].package.links;
    if (typeof repository !== "string") {
      await appendFile(
        req.logFile,
        `FATAL ERROR: Cannot find the git repository of ${req.lib} in the npm registry.`
      );
      return "STEP_FAILURE";
    }
    return repository;
  },
};

export const gitUrl = async (
  req: ExecuteRequest,
  find: EcoFind
): Promise<StepResult | string> => {
  const fetcher = ecosystemFetchers[find.ecosystem];
  if (!fetcher) {
    await appendFile(
      req.logFile,
      `FATAL ERROR: Cannot find packages in the ${find.ecosystem} yet.`
    );
    return "STEP_FAILURE";
  }
  try {
    const libPath = fetcher(req, find);
    return libPath;
  } catch (err) {
    await appendFile(
      req.logFile,
      `FATAL ERROR: Could not find ${req.lib} in the ${find.ecosystem} ecosystem`
    );
    return "STEP_FAILURE";
  }
};

const ecoFind = async (
  req: ExecuteRequest,
  find: EcoFind
): Promise<StepResult> => {
  const url = await gitUrl(req, find);
  if (url === "STEP_FAILURE") {
    return url;
  }
  const res = await runCommand({
    timeout: find.timeout || req.defaultTimeout,
    command: `git clone ${url} ${req.cwd}`,
    cwd: process.cwd(),
    outputFile: req.logFile,
  });
  return res;
};

export default ecoFind;
