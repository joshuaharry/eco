import { parseArgv } from "./argParse";
import { mockSideEffects } from "./testUtils";

describe("Parsing CLI arguments", () => {
  test("Works when they are all provided", () => {
    const res = parseArgv(["eco", "-f", "3", "-s", "tmp.json"]);
    expect(res.filesPath).toEqual("3");
    expect(res.strategyPath).toEqual("tmp.json");
  });
  test("Works when we ask for help", async () => {
    const { exitMock } = await mockSideEffects(() => parseArgv(["eco", "-h"]));
    expect(exitMock).toHaveBeenCalledWith(0);
  });
  test("Fails appropriately if we don't specify enough input", async () => {
    const { exitMock, errorMock } = await mockSideEffects(() =>
      parseArgv(["eco"])
    );
    expect(errorMock).toHaveBeenCalled();
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
