import type { StrategyRequest } from "./interpret";

export const usageAndExit = (exitCode: number): never => {
  console.log(`Usage: eco [-h][--help]
                       [-s | --stratgegy <path>]
                       [-f | --file-list <path>]
		       [-n | --no-cleanup]
		       [<path> ...]

eco - A tool for understanding your software's ecosystem.

Think of eco as an interpreter; you can provide it instructions for how to
fetch some code from the internet and take actions on it, and it will run those
instructions for you in such a way as to to make searching and understanding the
results more straightforward. These instructions are called strategies and are
currently configured via JSON files; you can place them into ~/.eco for your
convenience.

For more information about the project and how to write strategies, please see:
https://github.com/joshuaharry/eco
`);
  process.exit(exitCode);
};

export const parseArgv = (argv: string[]): StrategyRequest => {
  const req: StrategyRequest = { strategyPath: "", filesPath: "", filesList: [], cleanup: true };
  const length = argv.length;
  for (let i = 0; i < length; ++i) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "-h" || arg === "--help") {
      return usageAndExit(0);
    } else if ((arg === "-s" || arg === "--strategy") && next) {
      req.strategyPath = next;
      ++i;
    } else if ((arg === "-f" || arg === "--file-list") && next) {
      req.filesPath = next;
      ++i;
    } else if ((arg === "-n" || arg === "--no-cleanup") && next) {
      req.cleanup = false;
    } else {
      req.filesList.push(<string>arg);
    }
  }
  if (req.strategyPath && (req.filesPath || req.filesList)) {
    return req;
  }
  console.error("Error: could not parse arguments.\n");
  return usageAndExit(1);
};