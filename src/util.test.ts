import { run, programExists, readlines, runCommand } from "./util";
import path from "path";

describe("Our run method", () => {
  test("Works on a simple echo command", async () => {
    const res = await run("echo hi");
    expect(res.stdout).toMatch("hi");
  });
  test("Program exists works with node", async () => {
    const res = await programExists("node");
    expect(res).toBe(true);
  });
  test("Program exists works with a command that does not exist", async () => {
    const res = await programExists("does-not-exist-on-path");
    expect(res).toBe(false);
  });
  test("Readlines works the way that we would expect it to", async () => {
    const res = readlines(path.join(__dirname, "lines"));
    expect(res).toEqual(["a", "b", "c", "d", "e"]);
  });
  test("Run command works when the timeout is shorter than the command", async () => {
    const res = await runCommand({
      command: "sleep 3000 && exit 0",
      timeout: 0,
      outputFile: "test.log",
      cwd: process.cwd(),
    });
    expect(res).toEqual("OPERATION_TIMEOUT");
  });
  test("Works when the command is shorter than the command", async () => {
    const res = await runCommand({
      command: "exit 0",
      timeout: 3000,
      outputFile: "test.log",
      cwd: process.cwd(),
    });
    expect(res).toEqual("STEP_SUCCESS");
  });
  test("Works when the command fails", async () => {
    const res = await runCommand({
      command: "exit 1",
      timeout: 3000,
      outputFile: "test.log",
      cwd: process.cwd(),
    });
    expect(res).toEqual("STEP_FAILURE");
  });
});
