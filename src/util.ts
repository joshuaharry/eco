import { exec } from "child_process";
import { promisify } from "util";
export { mkdirp } from "fs-extra";
import { promises } from "fs-extra";

const { readFile } = promises;

export const run = promisify(exec);

// TODO: Consider checking $PATH by hand instead of shelling out.
export const programExists = async (theProgram: string): Promise<boolean> =>
  run(`command -v ${theProgram}`)
    .then(() => true)
    .catch(() => false);

export const readlines = async (filePath: string): Promise<string[]> => {
  const theFile = await readFile(filePath, { encoding: "utf-8" });
  return theFile.split("\n").filter((x) => x !== "");
};
