import { useRef, useState, useCallback } from 'react';
import {
  useDebounce,
  useOnWindowResize,
  useDidMount,
  useDidUpdate,
} from 'rooks';

const defaultEllipsis = '...';

let key = 0;
const getNewKey = () => `__clamp_text_key__${key++}`;

interface ClampTextConfig {
  text: string;
  ellipsis: string | number;
  lines?: number;
  expanded?: boolean;
  debounceTime?: number;
  charWidth?: number;
}

interface ClampLineParams {
  lineHeight: number;
  originalText: string;
  expanded: boolean;
  ellipsis?: string | number;
  lines: number;
  charWidth: number;
}

export function useClampText({
  text,
  ellipsis = defaultEllipsis,
  lines = 3,
  expanded = false,
  debounceTime = 300,
  charWidth = 1.2,
}: ClampTextConfig) {
  const [{ noClamp, clampedText, key }, setState] = useState(() => ({
    noClamp: false,
    clampedText: '.',
    key: getNewKey(),
  }));

  const nodeRef = useRef<HTMLElement | null>();
  const lineHeightRef = useRef(0);

  const clampLines = useCallback(
    ({
      lineHeight,
      originalText,
      expanded,
      ellipsis,
      lines,
      charWidth,
    }: ClampLineParams) => {
      const node = nodeRef.current;
      if (!node) {
        return;
      }
      if (!originalText || expanded) {
        setState({
          noClamp: true,
          clampedText: originalText,
          key: getNewKey(),
        });
        return;
      }

      const maxHeight = lineHeight * lines + 1;
      let ellipsisLength = 0;
      if (typeof ellipsis === 'string') {
        ellipsisLength =
          ellipsis === defaultEllipsis
            ? 5
            : Math.ceil(ellipsis.length * charWidth);
      } else if (typeof ellipsis === 'number') {
        ellipsisLength = Math.ceil(ellipsis * charWidth);
      }

      let start = 0;
      let middle = 0;
      let end = originalText.length;

      if (!node.clientHeight) {
        return;
      }

      function moveMarkers() {
        const clientHeight = node?.clientHeight ?? 1;
        if (clientHeight <= maxHeight) {
          start = middle + 1;
        } else {
          end = middle - 1;
        }
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

        moveMarkers();
      }

      const clampedText =
        originalText.slice(0, Math.max(middle - ellipsisLength, 0)).trim() +
        (typeof ellipsis === 'string' ? ellipsis : '');

      node.innerText = clampedText;
      setState({
        noClamp: false,
        clampedText,
        key: getNewKey(),
      });
    },
    []
  );
  const debouncedClampLines = useDebounce(clampLines, debounceTime);
  useOnWindowResize(() =>
    debouncedClampLines({
      lineHeight: lineHeightRef.current,
      originalText: text,
      expanded,
      ellipsis,
      lines,
      charWidth,
    })
  );

  useDidMount(() => {
    if (text && !lineHeightRef.current) {
      const lineHeight = (nodeRef.current?.clientHeight ?? 1) + 1;
      lineHeightRef.current = lineHeight;
      clampLines({
        lineHeight,
        originalText: text,
        expanded,
        ellipsis,
        lines,
        charWidth,
      });
    }
  });
  useDidUpdate(() => {
    clampLines({
      lineHeight: lineHeightRef.current,
      originalText: text,
      expanded,
      ellipsis,
      lines,
      charWidth,
    });
  }, [expanded, text, charWidth, ellipsis, lines]);

  return [
    nodeRef,
    {
      noClamp,
      clampedText,
      key,
    },
  ] as const;
}
