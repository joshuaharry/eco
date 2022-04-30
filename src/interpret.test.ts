import { toValidUnixName } from "./interpret";

describe("Valid unix names", () => {
  test("Succeed as desired", () => {
    expect(toValidUnixName("@test/hello")).toEqual("@test-hello");
  });
});
