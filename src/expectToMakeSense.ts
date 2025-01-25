import { expect, type CustomMatcher } from "bun:test";

import { doesThisMakeSense } from "./doesThisMakeSense";

const toMakeSense: CustomMatcher<unknown, any[]> = async (actual: unknown) => {
  const { makesSense, reasoning } = await doesThisMakeSense(actual as State);

  return {
    pass: makesSense,
    message: () => `This state does not make sense: ${reasoning}`,
  };
};

interface State {
  messages: { role: string; content: string }[];
  seed: number;
}

expect.extend({
  toMakeSense,
});

interface MyCustomMatchers {
  toMakeSense(): Promise<void>;
}

declare module "bun:test" {
  interface Matchers<T> extends MyCustomMatchers {}
}
