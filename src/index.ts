import { useRef, useState, useCallback, useEffect } from "react";

const DEFAULT_ELLIPSIS = "...";

let keyCounter = 0;
const getNewKey = () => `__clamp_text_key__${keyCounter++}`;

export interface ClampTextConfig {
  text: string;
  ellipsis?: string | number;
  lines?: number;
  expanded?: boolean;
  debounceTime?: number;
  charWidth?: number;
}

interface ClampLineParams {
  lineHeight: number;
  originalText: string;
  expanded: boolean;
  ellipsis: string | number;
  lines: number;
  charWidth: number;
}

interface ClampState {
  noClamp: boolean;
  clampedText: string;
  key: string;
}

export function useClampText({
  text,
  ellipsis = DEFAULT_ELLIPSIS,
  lines = 3,
  expanded = false,
  debounceTime = 300,
  charWidth = 1.2,
}: ClampTextConfig) {
  const [state, setState] = useState<ClampState>(() => ({
    noClamp: false,
    clampedText: ".",
    key: getNewKey(),
  }));

  const nodeRef = useRef<HTMLElement | null>(null);
  const lineHeightRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clampLines = useCallback(
    ({
      lineHeight,
      originalText,
      expanded: isExpanded,
      ellipsis: ellipsisValue,
      lines: lineCount,
      charWidth: charWidthValue,
    }: ClampLineParams) => {
      const node = nodeRef.current;
      if (!node) {
        return;
      }

      if (!originalText || isExpanded) {
        setState({
          noClamp: true,
          clampedText: originalText,
          key: getNewKey(),
        });
        return;
      }

      const maxHeight = lineHeight * lineCount + 1;
      let ellipsisLength = 0;
      if (typeof ellipsisValue === "string") {
        ellipsisLength =
          ellipsisValue === DEFAULT_ELLIPSIS ? 5 : Math.ceil(ellipsisValue.length * charWidthValue);
      } else if (typeof ellipsisValue === "number") {
        ellipsisLength = Math.ceil(ellipsisValue * charWidthValue);
      }

      let start = 0;
      let middle = 0;
      let end = originalText.length;

      if (!node.clientHeight) {
        return;
      }

      while (start <= end) {
        middle = Math.floor((start + end) / 2);
        node.innerText = originalText.slice(0, middle);

        if (middle === originalText.length) {
          setState({
            clampedText: originalText,
            noClamp: true,
            key: getNewKey(),
          });
          return;
        }

        const clientHeight = node.clientHeight;
        if (clientHeight <= maxHeight) {
          start = middle + 1;
        } else {
          end = middle - 1;
        }
      }

      const clampedText =
        originalText.slice(0, Math.max(middle - ellipsisLength, 0)).trim() +
        (typeof ellipsisValue === "string" ? ellipsisValue : "");

      node.innerText = clampedText;
      setState({
        noClamp: false,
        clampedText,
        key: getNewKey(),
      });
    },
    [],
  );

  useEffect(() => {
    if (!text) {
      setState({ noClamp: true, clampedText: "", key: getNewKey() });
      return;
    }
    if (!lineHeightRef.current) {
      const lineHeight = (nodeRef.current?.clientHeight ?? 1) + 1;
      lineHeightRef.current = lineHeight;
    }
    clampLines({
      lineHeight: lineHeightRef.current,
      originalText: text,
      expanded,
      ellipsis,
      lines,
      charWidth,
    });
  }, [text, expanded, ellipsis, lines, charWidth, clampLines]);

  useEffect(() => {
    const handleResize = () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        clampLines({
          lineHeight: lineHeightRef.current,
          originalText: text,
          expanded,
          ellipsis,
          lines,
          charWidth,
        });
      }, debounceTime);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [text, expanded, ellipsis, lines, charWidth, debounceTime, clampLines]);

  return [
    nodeRef,
    {
      noClamp: state.noClamp,
      clampedText: state.clampedText,
      key: state.key,
    },
  ] as const;
}
