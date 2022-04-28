import { exec } from "child_process";
import { promisify } from "util";
export { mkdirp } from "fs-extra";
import { readFileSync } from "fs-extra";

export const run = promisify(exec);

// TODO: Consider checking $PATH by hand instead of shelling out.
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
