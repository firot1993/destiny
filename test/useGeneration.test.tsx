import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGeneration } from "@/hooks/useGeneration";

const mockFetch = vi.fn();
beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

function makeMockResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    headers: new Headers({
      "X-Daily-Remaining": "100",
      "X-Daily-Limit": "100",
    }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

describe("useGeneration bullet lifecycle", () => {
  it("converts scanned fragments into flying bullets", async () => {
    mockFetch.mockResolvedValueOnce(
      makeMockResponse({
        content: [{ type: "text", text: "1:: a door\n2:: red dust\n3:: a held breath" }],
      })
    );

    const { result } = renderHook(() =>
      useGeneration({
        fields: {} as any,
        big5: [5, 5, 5, 5, 5],
        guidance: 7,
        denoiseSteps: 4,
        provider: "openrouter",
        model: "test",
        lang: "en",
        t: (k: string) => k,
      })
    );

    await act(async () => {
      await result.current.scanNoiseFragments();
    });

    expect(result.current.bullets).toHaveLength(3);
    expect(result.current.bullets.every((b) => b.status === "flying")).toBe(true);
  });

  it("catch moves bullet to caught status with chamber index 0", async () => {
    mockFetch.mockResolvedValueOnce(
      makeMockResponse({
        content: [{ type: "text", text: "1:: a\n2:: b" }],
      })
    );
    const { result } = renderHook(() =>
      useGeneration({
        fields: {} as any,
        big5: [5, 5, 5, 5, 5],
        guidance: 7,
        denoiseSteps: 4,
        provider: "openrouter",
        model: "test",
        lang: "en",
        t: (k: string) => k,
      })
    );
    await act(async () => { await result.current.scanNoiseFragments(); });
    act(() => { result.current.catchBullet(1); });
    const caught = result.current.bullets.find((b) => b.id === 1);
    expect(caught?.status).toBe("caught");
    expect(caught?.chamberIndex).toBe(0);
  });

  it("transitions to ready phase when 6 bullets are caught", async () => {
    mockFetch.mockResolvedValueOnce(
      makeMockResponse({
        content: [{ type: "text", text: "1:: a\n2:: b\n3:: c\n4:: d\n5:: e\n6:: f\n7:: g" }],
      })
    );
    const { result } = renderHook(() =>
      useGeneration({
        fields: {} as any,
        big5: [5, 5, 5, 5, 5],
        guidance: 7,
        denoiseSteps: 4,
        provider: "openrouter",
        model: "test",
        lang: "en",
        t: (k: string) => k,
      })
    );
    await act(async () => { await result.current.scanNoiseFragments(); });
    act(() => {
      for (let i = 1; i <= 6; i++) result.current.catchBullet(i);
    });
    expect(result.current.runPhase).toBe("ready");
  });
});
