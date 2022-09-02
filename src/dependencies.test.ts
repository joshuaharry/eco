import { validate } from "./dependencies";
import { mockSideEffects } from "./testUtils";

describe("Our dependencies", () => {
  test("Works when they exist", async () => {
    const { exitMock } = await mockSideEffects(() =>
      validate({
        required: [
          {
            program: "node",
            checkOutput: { argument: "--version", includes: process.version },
          },
          { program: "git" },
        ],
      	     }, "strategy")
    );
    expect(exitMock).not.toHaveBeenCalled();
  });
  test("Fails when they do not exist", async () => {
    const { exitMock } = await mockSideEffects(() =>
      validate({
        required: [
          {
            program: "does-not-exist",
          },
          { program: "also-does-not-exist" },
        ],
      	     }, "strategy")
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
