import Providers from "./Providers";
import { render, screen } from "./testUtils";
describe("Our Providers component", () => {
  test("Does not crash on rendering", () => {
    render(<Providers>Hello!</Providers>);
    screen.getByText("Hello!");
  });
});
