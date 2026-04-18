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

  it("transitions to ready when all remaining bullets are gone but some are caught", async () => {
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

    await act(async () => {
      await result.current.scanNoiseFragments();
    });

    act(() => {
      result.current.catchBullet(1);
      result.current.ricochetSingle(2);
      result.current.ricochetSingle(2);
      result.current.ricochetSingle(2);
    });

    expect(result.current.runPhase).toBe("ready");
  });

  it("runs a hidden anti-echo cleanup pass after the final denoise draft", async () => {
    mockFetch
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "1:: a held breath" }],
        })
      )
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "Draft trajectory before cleanup" }],
        })
      )
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "Cleaned final trajectory" }],
        })
      );

    const { result } = renderHook(() =>
      useGeneration({
        fields: {
          age: "20–29",
          mobility: "Can relocate for the right upside",
          currentMode: "Early-career builder",
          trajectoryFocus: "Turning skill into real leverage",
          hiddenEdge: "Runway that buys patience",
          recurringTrap: "Waiting for certainty that never arrives",
          costWillingness: "Visibility before I feel ready",
          magneticScene: "A small room where one thing gets better every week",
          socialMirror: "That the quiet period was not stagnation",
          obsessions: "Leverage that keeps paying after the effort ends",
          delayFailureMode: "Waiting for certainty that never arrives",
          inflection: "A stranger bets on me before the proof is in",
          location: "Can relocate for the right upside",
          skills: "",
          resources: "Runway that buys patience",
          constraints: "Waiting for certainty that never arrives",
          workStyle: "A small room where one thing gets better every week",
          riskTolerance: "Visibility before I feel ready",
          timeHorizon: "That the quiet period was not stagnation",
        },
        big5: [6, 6, 5, 5, 7],
        guidance: 7,
        denoiseSteps: 2,
        provider: "openrouter",
        model: "test",
        lang: "en",
        t: (k: string) => k,
        curationAnswers: {
          whyThese: "They feel dangerous but true",
          rejectedFuture: "too safe",
        },
      })
    );

    await act(async () => {
      await result.current.scanNoiseFragments();
    });

    act(() => {
      result.current.catchBullet(1);
    });

    await act(async () => {
      await result.current.generate();
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);
    const cleanupRequest = JSON.parse(mockFetch.mock.calls[2][1].body as string) as {
      messages: Array<{ content: string }>;
    };
    expect(cleanupRequest.messages[0].content).toContain(
      "no longer sounds like a paraphrase of a questionnaire"
    );
    expect(result.current.trajectories[0]).toBe("Cleaned final trajectory");
  });
});
