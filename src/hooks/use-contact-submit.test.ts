import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useContactSubmit } from "./use-contact-submit";

const data = { name: "Taro", email: "taro@example.com", message: "Hello", honeypot: "" };

describe("useContactSubmit", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("starts idle", () => {
    const { result } = renderHook(() => useContactSubmit());

    expect(result.current.status).toBe("idle");
  });

  it("posts the form data as JSON and ends as sent on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useContactSubmit());

    await act(async () => {
      await result.current.submit(data);
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    expect(result.current.status).toBe("sent");
  });

  it("ends as error and logs when the server rejects the request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useContactSubmit());

    await act(async () => {
      await result.current.submit(data);
    });

    expect(result.current.status).toBe("error");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("ends as error when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useContactSubmit());

    await act(async () => {
      await result.current.submit(data);
    });

    expect(result.current.status).toBe("error");
  });

  it("ends as error when the server answers ok but the body is not the success shape", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ x: 1 }) }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useContactSubmit());

    await act(async () => {
      await result.current.submit(data);
    });

    expect(result.current.status).toBe("error");
  });

  it("ends as error when the body cannot be read", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("bad json");
        },
      }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useContactSubmit());

    await act(async () => {
      await result.current.submit(data);
    });

    expect(result.current.status).toBe("error");
  });
});
