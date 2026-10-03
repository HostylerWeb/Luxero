import {
  vi,
  afterAll as vitestAfterAll,
  afterEach as vitestAfterEach,
  beforeAll as vitestBeforeAll,
  beforeEach as vitestBeforeEach,
  describe as vitestDescribe,
  expect as vitestExpect,
  it as vitestIt,
  test as vitestTest,
} from "vitest";

export const mock = vi.fn as unknown as typeof import("vitest").vi.fn & {
  (fn?: () => unknown): () => unknown;
  module: (id: string, factory: () => unknown) => void;
};

mock.module = (id: string, factory: () => unknown): void => {
  vi.mock(id, factory);
};

export const test = vitestTest;
export const describe = vitestDescribe;
export const it = vitestIt;
export const expect = vitestExpect;
export const beforeAll = vitestBeforeAll;
export const afterAll = vitestAfterAll;
export const beforeEach = vitestBeforeEach;
export const afterEach = vitestAfterEach;
