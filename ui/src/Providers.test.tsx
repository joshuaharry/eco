import Providers from "./Providers";
import { screen } from "./testUtils";
import { render } from '@testing-library/react';

describe("Our Providers component", () => {
  test("Does not crash on rendering", () => {
    render(<Providers>Hello!</Providers>);
    screen.getByText("Hello!");
  });
});
