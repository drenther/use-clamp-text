import { render, renderHook, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { useClampText, type ClampTextConfig } from "../src/index.js";

const LINE_HEIGHT = 20;
const CHARS_PER_LINE = 30;

function simulateClientHeight(element: HTMLElement): number {
  const text = element.innerText ?? "";
  if (!text) return LINE_HEIGHT;
  const lines = Math.ceil(text.length / CHARS_PER_LINE) || 1;
  return lines * LINE_HEIGHT;
}

function ClampTextComponent(props: ClampTextConfig) {
  const [ref, state] = useClampText(props);

  return createElement(
    "div",
    { "data-testid": "wrapper" },
    createElement(
      "div",
      {
        ref: ref as React.RefObject<HTMLDivElement>,
        "data-testid": "clamp-target",
        style: { width: "200px", lineHeight: "20px", fontSize: "16px" },
      },
      state.clampedText,
    ),
    createElement("span", { "data-testid": "no-clamp" }, String(state.noClamp)),
    createElement("span", { "data-testid": "clamped-text" }, state.clampedText),
    createElement("span", { "data-testid": "key" }, state.key),
  );
}

describe("useClampText", () => {
  let clientHeightSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        return simulateClientHeight(this);
      });
  });

  afterEach(() => {
    vi.useRealTimers();
    clientHeightSpy.mockRestore();
    cleanup();
  });

  describe("hook API shape", () => {
    it("returns a ref and state object", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world" }));

      const [ref, state] = result.current;
      expect(ref).toBeDefined();
      expect(state).toHaveProperty("noClamp");
      expect(state).toHaveProperty("clampedText");
      expect(state).toHaveProperty("key");
    });

    it("returns a tuple of [ref, state]", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world" }));

      expect(result.current).toHaveLength(2);
    });

    it("state contains noClamp boolean", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world" }));

      expect(typeof result.current[1].noClamp).toBe("boolean");
    });

    it("state contains clampedText string", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world" }));

      expect(typeof result.current[1].clampedText).toBe("string");
    });

    it("state contains key string matching pattern", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world" }));

      expect(result.current[1].key).toMatch(/^__clamp_text_key__\d+$/);
    });

    it("initializes with placeholder state before DOM attachment", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world" }));

      expect(result.current[1].clampedText).toBe(".");
    });

    it("initializes ref with null", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world" }));

      expect(result.current[0].current).toBeNull();
    });

    it("ref is mutable", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world" }));

      const mockElement = document.createElement("div");

      act(() => {
        (result.current[0] as { current: HTMLElement | null }).current = mockElement;
      });

      expect(result.current[0].current).toBe(mockElement);
    });
  });

  describe("config defaults", () => {
    it("uses default ellipsis of '...'", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world" }));
      expect(result.current[1]).toBeDefined();
    });

    it("accepts custom string ellipsis", () => {
      const { result } = renderHook(() =>
        useClampText({ text: "Hello world", ellipsis: " [more]" }),
      );
      expect(result.current[1]).toBeDefined();
    });

    it("accepts numeric ellipsis (trim count)", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world", ellipsis: 5 }));
      expect(result.current[1]).toBeDefined();
    });

    it("accepts custom lines value", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world", lines: 5 }));
      expect(result.current).toBeDefined();
    });

    it("accepts custom debounceTime", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world", debounceTime: 500 }));
      expect(result.current).toBeDefined();
    });

    it("accepts custom charWidth", () => {
      const { result } = renderHook(() => useClampText({ text: "Hello world", charWidth: 1.5 }));
      expect(result.current).toBeDefined();
    });
  });

  describe("clamping behavior", () => {
    it("does not clamp when text is empty", () => {
      const { getByTestId } = render(createElement(ClampTextComponent, { text: "" }));

      expect(getByTestId("no-clamp").textContent).toBe("true");
      expect(getByTestId("clamped-text").textContent).toBe("");
    });

    it("does not clamp when expanded is true", () => {
      const longText = "a".repeat(500);
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: longText, expanded: true }),
      );

      expect(getByTestId("no-clamp").textContent).toBe("true");
      expect(getByTestId("clamped-text").textContent).toBe(longText);
    });

    it("clamps long text to specified lines", () => {
      const longText = "a".repeat(500);
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: longText, lines: 2 }),
      );

      const clampedText = getByTestId("clamped-text").textContent ?? "";
      expect(clampedText.length).toBeLessThan(longText.length);
    });

    it("appends string ellipsis when clamping", () => {
      const longText = "a".repeat(500);
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: longText, lines: 1, ellipsis: "..." }),
      );

      const clampedText = getByTestId("clamped-text").textContent ?? "";
      expect(clampedText).toContain("...");
    });

    it("does not append ellipsis with numeric ellipsis type", () => {
      const longText = "a".repeat(500);
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: longText, lines: 1, ellipsis: 5 }),
      );

      const clampedText = getByTestId("clamped-text").textContent ?? "";
      expect(clampedText).not.toContain("...");
    });

    it("does not clamp when text fits within lines", () => {
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: "Short", lines: 10 }),
      );

      expect(getByTestId("no-clamp").textContent).toBe("true");
      expect(getByTestId("clamped-text").textContent).toBe("Short");
    });
  });

  describe("reactivity to prop changes", () => {
    it("recalculates when text changes", () => {
      const { getByTestId, rerender } = render(
        createElement(ClampTextComponent, { text: "Hello" }),
      );

      const firstKey = getByTestId("key").textContent;

      rerender(createElement(ClampTextComponent, { text: "Different text now" }));

      const secondKey = getByTestId("key").textContent;
      expect(secondKey).not.toBe(firstKey);
    });

    it("recalculates when expanded changes", () => {
      const longText = "a".repeat(500);
      const { getByTestId, rerender } = render(
        createElement(ClampTextComponent, { text: longText, expanded: false }),
      );

      const firstKey = getByTestId("key").textContent;

      rerender(createElement(ClampTextComponent, { text: longText, expanded: true }));

      const secondKey = getByTestId("key").textContent;
      expect(secondKey).not.toBe(firstKey);
    });

    it("recalculates when lines changes", () => {
      const longText = "a".repeat(500);
      const { getByTestId, rerender } = render(
        createElement(ClampTextComponent, { text: longText, lines: 3 }),
      );

      const firstKey = getByTestId("key").textContent;

      rerender(createElement(ClampTextComponent, { text: longText, lines: 5 }));

      const secondKey = getByTestId("key").textContent;
      expect(secondKey).not.toBe(firstKey);
    });

    it("recalculates when charWidth changes", () => {
      const longText = "a".repeat(500);
      const { getByTestId, rerender } = render(
        createElement(ClampTextComponent, { text: longText, charWidth: 1.2 }),
      );

      const firstKey = getByTestId("key").textContent;

      rerender(createElement(ClampTextComponent, { text: longText, charWidth: 1.8 }));

      const secondKey = getByTestId("key").textContent;
      expect(secondKey).not.toBe(firstKey);
    });

    it("recalculates when ellipsis changes", () => {
      const longText = "a".repeat(500);
      const { getByTestId, rerender } = render(
        createElement(ClampTextComponent, { text: longText, ellipsis: "..." }),
      );

      const firstKey = getByTestId("key").textContent;

      rerender(createElement(ClampTextComponent, { text: longText, ellipsis: " [more]" }));

      const secondKey = getByTestId("key").textContent;
      expect(secondKey).not.toBe(firstKey);
    });

    it("switches from clamped to unclamped when expanded toggled", () => {
      const longText = "a".repeat(500);
      const { getByTestId, rerender } = render(
        createElement(ClampTextComponent, { text: longText, expanded: false, lines: 2 }),
      );

      expect(getByTestId("no-clamp").textContent).toBe("false");

      rerender(createElement(ClampTextComponent, { text: longText, expanded: true, lines: 2 }));

      expect(getByTestId("no-clamp").textContent).toBe("true");
      expect(getByTestId("clamped-text").textContent).toBe(longText);
    });
  });

  describe("resize handling", () => {
    it("adds a resize event listener on mount", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");

      renderHook(() => useClampText({ text: "Hello world" }));

      expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it("removes the resize event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useClampText({ text: "Hello world" }));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it("debounces the resize handler", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");

      renderHook(() => useClampText({ text: "Hello world", debounceTime: 200 }));

      const resizeHandler = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === "resize",
      )?.[1] as EventListener;

      expect(resizeHandler).toBeDefined();

      act(() => {
        resizeHandler(new Event("resize"));
        resizeHandler(new Event("resize"));
        resizeHandler(new Event("resize"));
      });

      addEventListenerSpy.mockRestore();
    });

    it("clears pending debounce on unmount", () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { unmount } = renderHook(() => useClampText({ text: "Hello world" }));

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it("recalculates on resize after debounce completes", () => {
      const longText = "a".repeat(500);
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: longText, lines: 2, debounceTime: 100 }),
      );

      const firstKey = getByTestId("key").textContent;

      act(() => {
        window.dispatchEvent(new Event("resize"));
        vi.advanceTimersByTime(100);
      });

      const secondKey = getByTestId("key").textContent;
      expect(secondKey).not.toBe(firstKey);
    });
  });

  describe("edge cases", () => {
    it("handles text with only whitespace", () => {
      const { getByTestId } = render(createElement(ClampTextComponent, { text: "   " }));
      expect(getByTestId("clamped-text").textContent).toBeDefined();
    });

    it("handles lines set to 1", () => {
      const longText = "a".repeat(500);
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: longText, lines: 1 }),
      );

      const clampedText = getByTestId("clamped-text").textContent ?? "";
      expect(clampedText.length).toBeLessThan(longText.length);
    });

    it("handles very large lines value without clamping", () => {
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: "Hello world", lines: 1000 }),
      );

      expect(getByTestId("no-clamp").textContent).toBe("true");
    });

    it("handles text with newlines", () => {
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: "Line 1\nLine 2\nLine 3\nLine 4" }),
      );
      expect(getByTestId("clamped-text").textContent).toBeDefined();
    });

    it("handles text with special characters", () => {
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: 'Hello <world> & "friends"' }),
      );
      expect(getByTestId("clamped-text").textContent).toBeDefined();
    });

    it("handles unicode text", () => {
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: "Hello 世界 🌍 مرحبا" }),
      );
      expect(getByTestId("clamped-text").textContent).toBeDefined();
    });

    it("handles zero charWidth gracefully", () => {
      const { getByTestId } = render(
        createElement(ClampTextComponent, { text: "Hello world", charWidth: 0 }),
      );
      expect(getByTestId("clamped-text").textContent).toBeDefined();
    });
  });
});
