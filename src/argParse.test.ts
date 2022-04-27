import { parseArgv } from "./argParse";

const mockSideEffects = (fn: () => void) => {
  const originalLog = console.log;
  const originalExit = process.exit;
  const originalError = console.error;
  const logMock = jest.fn();
  const exitMock = jest.fn();
  const errorMock = jest.fn();
  console.error = errorMock;
  console.log = logMock;
  // eslint-disable-next-line
  // @ts-ignore
  process.exit = exitMock;
  fn();
  console.log = originalLog;
  console.error = originalError;
  process.exit = originalExit;
  return { logMock, errorMock, exitMock };
};

describe("Parsing CLI arguments", () => {
  test("Works when they are all provided", () => {
    const res = parseArgv(["eco", "-f", "3", "-s", "tmp.json"]);
    expect(res.filesPath).toEqual("3");
    expect(res.strategyPath).toEqual("tmp.json");
  });
  test("Works when we ask for help", () => {
    const { exitMock } = mockSideEffects(() => parseArgv(["eco", "-h"]));
    expect(exitMock).toHaveBeenCalledWith(0);
  });
  test("Fails appropriately if we don't specify enough input", () => {
    const { exitMock, errorMock } = mockSideEffects(() => parseArgv(["eco"]));
    expect(errorMock).toHaveBeenCalled();
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
