import { gitUrl } from "./ecoFind";
import { rm } from "fs-extra";

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
        steps: [],
      },
      {
        ecosystem: "git",
        name: "Find the npm package.",
        uses: "@eco/find",
       },
       undefined
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
        steps: [],
      },
      {
        ecosystem: "npm",
        name: "Find the npm package.",
        uses: "@eco/find",
      }, 
      undefined
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
        steps: [],
      },
      {
        ecosystem: "not-a-real-ecosystem",
        name: "Find the npm package.",
        uses: "@eco/find",
      },
      undefined
    );
    expect(res).toEqual("STEP_FAILURE");
  });
});
