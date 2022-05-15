import { render as defaultRender } from "@testing-library/react";
import Providers from './Providers';
export { describe, expect, test } from "vitest";
export { screen, act } from "@testing-library/react";

// @ts-ignore
export const render: typeof defaultRender = (ui, options) => {
  return defaultRender(ui, { wrapper: Providers, ...options });
};
