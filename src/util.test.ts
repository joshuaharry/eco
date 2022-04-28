import { run, programExists, readlines } from "./util";
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
    const res = await readlines(path.join(__dirname, "lines"));
    expect(res).toEqual(["a", "b", "c", "d", "e"]);
  });
});
