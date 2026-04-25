import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
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

function sseDelta(text: string): string {
  return `data: ${JSON.stringify({
    choices: [{ delta: { content: text } }],
  })}\n\n`;
}

function makeStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "X-Daily-Remaining": "100",
        "X-Daily-Limit": "100",
      },
    }
  );
}

function makeOpenStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder();
  let close!: () => void;
  const response = new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        close = () => controller.close();
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "X-Daily-Remaining": "100",
        "X-Daily-Limit": "100",
      },
    }
  );
  return { response, close };
}

function deferredMockResponse() {
  let resolve!: (response: ReturnType<typeof makeMockResponse>) => void;
  const response = new Promise<ReturnType<typeof makeMockResponse>>((res) => {
    resolve = res;
  });
  return { response, resolve };
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

    let generatePromise!: Promise<void>;
    act(() => {
      generatePromise = result.current.generate();
    });

    await waitFor(() => {
      expect(result.current.runPhase).toBe("steering");
    });

    act(() => {
      result.current.resumeFromSteering();
    });

    await act(async () => {
      await generatePromise;
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);
    const cleanupRequest = JSON.parse(mockFetch.mock.calls[2][1].body as string) as {
      stream?: boolean;
      messages: Array<{ content: string }>;
    };
    expect(cleanupRequest.stream).toBe(true);
    expect(cleanupRequest.messages[0].content).toContain(
      "sounds like it came from a personality test"
    );
    expect(result.current.trajectories[0]).toBe("Cleaned final trajectory");
  });

  it("keeps streamed draft visible while cleanup is pending", async () => {
    let resolveCleanup!: (response: ReturnType<typeof makeMockResponse>) => void;
    const cleanupResponse = new Promise<ReturnType<typeof makeMockResponse>>(
      (resolve) => {
        resolveCleanup = resolve;
      }
    );

    mockFetch
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "1:: a held breath" }],
        })
      )
      .mockResolvedValueOnce(
        makeStreamResponse([
          sseDelta("Draft "),
          sseDelta("trajectory"),
          "data: [DONE]\n\n",
        ])
      )
      .mockReturnValueOnce(cleanupResponse);

    const { result } = renderHook(() =>
      useGeneration({
        fields: {
          age: "20-29",
          mobility: "Can relocate",
          currentMode: "Builder",
          trajectoryFocus: "Leverage",
          hiddenEdge: "Runway",
          recurringTrap: "Waiting",
          costWillingness: "Visibility",
          magneticScene: "A small room",
          socialMirror: "Not stagnation",
          obsessions: "Leverage",
          delayFailureMode: "Waiting",
          inflection: "A stranger bets on me",
          location: "Can relocate",
          skills: "",
          resources: "Runway",
          constraints: "Waiting",
          workStyle: "A small room",
          riskTolerance: "Visibility",
          timeHorizon: "Not stagnation",
        },
        big5: [6, 6, 5, 5, 7],
        guidance: 7,
        denoiseSteps: 2,
        provider: "openrouter",
        model: "test",
        lang: "en",
        t: (k: string) => k,
        curationAnswers: {
          whyThese: "They feel true",
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

    await waitFor(() => {
      expect(result.current.runPhase).toBe("ready");
    });

    act(() => {
      void result.current.generate();
    });

    await waitFor(() => {
      expect(result.current.runPhase).toBe("steering");
      expect(result.current.streamingText).toBe("Draft trajectory");
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.resumeFromSteering();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.current.streamingText).toBe("Draft trajectory");
    });

    await act(async () => {
      resolveCleanup(
        makeMockResponse({
          content: [{ type: "text", text: "Cleaned final trajectory" }],
        })
      );
    });

    await waitFor(() => {
      expect(result.current.trajectories[0]).toBe("Cleaned final trajectory");
    });
  });

  it("parses streamed SSE data split across network chunks", async () => {
    const fullDelta = sseDelta("Draft trajectory");
    const splitAt = fullDelta.indexOf("trajectory");

    mockFetch
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "1:: a held breath" }],
        })
      )
      .mockResolvedValueOnce(
        makeStreamResponse([
          fullDelta.slice(0, splitAt),
          fullDelta.slice(splitAt),
          "data: [DONE]\n\n",
        ])
      )
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "Cleaned final trajectory" }],
        })
      );

    const { result } = renderHook(() =>
      useGeneration({
        fields: {
          age: "20-29",
          mobility: "Can relocate",
          currentMode: "Builder",
          trajectoryFocus: "Leverage",
          hiddenEdge: "Runway",
          recurringTrap: "Waiting",
          costWillingness: "Visibility",
          magneticScene: "A small room",
          socialMirror: "Not stagnation",
          obsessions: "Leverage",
          delayFailureMode: "Waiting",
          inflection: "A stranger bets on me",
          location: "Can relocate",
          skills: "",
          resources: "Runway",
          constraints: "Waiting",
          workStyle: "A small room",
          riskTolerance: "Visibility",
          timeHorizon: "Not stagnation",
        },
        big5: [6, 6, 5, 5, 7],
        guidance: 7,
        denoiseSteps: 2,
        provider: "openrouter",
        model: "test",
        lang: "en",
        t: (k: string) => k,
        curationAnswers: {
          whyThese: "They feel true",
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

    let generatePromise!: Promise<void>;
    act(() => {
      generatePromise = result.current.generate();
    });

    await waitFor(() => {
      expect(result.current.runPhase).toBe("steering");
    });

    act(() => {
      result.current.resumeFromSteering();
    });

    await act(async () => {
      await generatePromise;
    });

    expect(result.current.error).toBeNull();
    expect(result.current.trajectories[0]).toBe("Cleaned final trajectory");
  });

  it("pauses after the final draft so cleanup can use a big-moment direction", async () => {
    const cleanupStream = makeOpenStreamResponse([
      sseDelta("Darker "),
      sseDelta("final"),
    ]);

    mockFetch
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "1:: a held breath" }],
        })
      )
      .mockResolvedValueOnce(
        makeStreamResponse([
          sseDelta("Final "),
          sseDelta("draft"),
          "data: [DONE]\n\n",
        ])
      )
      .mockResolvedValueOnce(cleanupStream.response);

    const { result } = renderHook(() =>
      useGeneration({
        fields: {
          age: "20-29",
          mobility: "Can relocate",
          currentMode: "Builder",
          trajectoryFocus: "Leverage",
          hiddenEdge: "Runway",
          recurringTrap: "Waiting",
          costWillingness: "Visibility",
          magneticScene: "A small room",
          socialMirror: "Not stagnation",
          obsessions: "Leverage",
          delayFailureMode: "Waiting",
          inflection: "A stranger bets on me",
          location: "Can relocate",
          skills: "",
          resources: "Runway",
          constraints: "Waiting",
          workStyle: "A small room",
          riskTolerance: "Visibility",
          timeHorizon: "Not stagnation",
        },
        big5: [6, 6, 5, 5, 7],
        guidance: 7,
        denoiseSteps: 2,
        provider: "openrouter",
        model: "test",
        lang: "en",
        t: (k: string) => k,
        curationAnswers: {
          whyThese: "They feel true",
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

    await waitFor(() => {
      expect(result.current.runPhase).toBe("ready");
    });

    act(() => {
      void result.current.generate();
    });

    await waitFor(() => {
      expect(result.current.runPhase).toBe("steering");
      expect(result.current.streamingText).toBe("Final draft");
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.setSteeringNote("Make it darker and more concrete.");
      result.current.resumeFromSteering();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.current.streamingText).toBe("Darker final");
    });

    const cleanupRequest = JSON.parse(mockFetch.mock.calls[2][1].body as string) as {
      messages: Array<{ content: string }>;
    };
    expect(cleanupRequest.messages[0].content).toContain(
      "Make it darker and more concrete."
    );

    await act(async () => {
      cleanupStream.close();
    });
  });

  it("shows non-streamed sharpen drafts in the live preview during the next helper pass", async () => {
    const verifyResponse = deferredMockResponse();

    mockFetch
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "1:: a held breath" }],
        })
      )
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "Structure draft" }],
        })
      )
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "- Make it less abstract" }],
        })
      )
      .mockResolvedValueOnce(
        makeMockResponse({
          content: [{ type: "text", text: "Step 2 sharpen draft" }],
        })
      )
      .mockReturnValueOnce(verifyResponse.response);

    const { result } = renderHook(() =>
      useGeneration({
        fields: {
          age: "20-29",
          mobility: "Can relocate",
          currentMode: "Builder",
          trajectoryFocus: "Leverage",
          hiddenEdge: "Runway",
          recurringTrap: "Waiting",
          costWillingness: "Visibility",
          magneticScene: "A small room",
          socialMirror: "Not stagnation",
          obsessions: "Leverage",
          delayFailureMode: "Waiting",
          inflection: "A stranger bets on me",
          location: "Can relocate",
          skills: "",
          resources: "Runway",
          constraints: "Waiting",
          workStyle: "A small room",
          riskTolerance: "Visibility",
          timeHorizon: "Not stagnation",
        },
        big5: [6, 6, 5, 5, 7],
        guidance: 7,
        denoiseSteps: 4,
        provider: "openrouter",
        model: "test",
        lang: "en",
        t: (k: string) => k,
        curationAnswers: {
          whyThese: "They feel true",
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

    act(() => {
      void result.current.generate();
    });

    await waitFor(() => {
      expect(result.current.runPhase).toBe("steering");
      expect(result.current.streamingText).toBe("Structure draft");
    });

    act(() => {
      result.current.resumeFromSteering();
    });

    await waitFor(() => {
      expect(result.current.streamingText).toBe("Step 2 sharpen draft");
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    await act(async () => {
      verifyResponse.resolve(
        makeMockResponse({
          content: [{ type: "text", text: "REVISION_OK" }],
        })
      );
    });
  });
});
