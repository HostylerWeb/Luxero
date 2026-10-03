import { afterEach, describe, expect, test, vi } from "vitest";

const __mocks = vi.hoisted(() => ({
  updateSessionSnapshot: vi.fn(),
  getSession: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock("./session-snapshot", () => ({
  updateSessionSnapshot: __mocks.updateSessionSnapshot,
}));

vi.mock("../query-client", () => ({
  getGlobalQueryClient: () => ({
    invalidateQueries: __mocks.invalidateQueries,
  }),
}));

vi.mock("./client", () => ({
  authClient: { getSession: __mocks.getSession },
}));

describe("refreshAuthSession", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("invalidates session query and updates snapshot on success", async () => {
    const sessionPayload = { user: { id: "u_1" }, session: { id: "s_1" } };
    __mocks.getSession.mockResolvedValue({ data: sessionPayload });

    const { refreshAuthSession } = await import("./refresh-session");
    await refreshAuthSession();

    expect(__mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["session"] });
    expect(__mocks.updateSessionSnapshot).toHaveBeenCalledWith(sessionPayload);
  });

  test("updates snapshot with null on error", async () => {
    __mocks.getSession.mockRejectedValue(new Error("Network error"));

    const { refreshAuthSession } = await import("./refresh-session");
    await refreshAuthSession();

    expect(__mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["session"] });
    expect(__mocks.updateSessionSnapshot).toHaveBeenCalledWith(null);
  });
});
