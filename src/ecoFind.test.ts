import { gitUrl } from "./ecoFind";
import { rm } from "fs-extra";
import { HostShell } from "./shell";

const shell = new HostShell();

afterEach(async () => {
  await rm("ecoFindTest.log", { force: true });
});

describe("Getting GIT urls", () => {
  test("Works with git (e.g., every line in the packages file is a GIT url)", async () => {
    const res = await gitUrl(
      {
        cleanup: [],
        cwd: process.cwd(),
        defaultTimeout: 5000,
        lib: "identity",
        logFile: "ecoFindTest.log",
        strategyName: "strategy",
        steps: [],
      },
      {
        ecosystem: "git",
        name: "Find the npm package.",
        uses: "@eco/find",
       },
       shell
    );
    expect(res).toEqual("identity");
  });
  test("Works from npm", async () => {
    const res = await gitUrl(
      {
        cleanup: [],
        cwd: process.cwd(),
        defaultTimeout: 5000,
        lib: "react",
        logFile: "ecoFindTest.log",
        strategyName: "strategy",
        steps: [],
      },
      {
        ecosystem: "npm",
        name: "Find the npm package.",
        uses: "@eco/find",
      }, 
      shell
    );
    expect(res).toEqual("https://github.com/facebook/react");
  });
  test("Works if the fetcher does not exist", async () => {
    const res = await gitUrl(
      {
        cleanup: [],
        cwd: process.cwd(),
        defaultTimeout: 5000,
        lib: "react",
        logFile: "ecoFindTest.log",
        strategyName: "strategy",
        steps: [],
      },
      {
        ecosystem: "not-a-real-ecosystem",
        name: "Find the npm package.",
        uses: "@eco/find",
      },
      shell
    );
    expect(res).toEqual("STEP_FAILURE");
  });
});
