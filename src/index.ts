import { useRef, useState, useCallback } from 'react';
import {
  useDebounce,
  useOnWindowResize,
  useDidMount,
  useDidUpdate,
} from 'rooks';

const defaultEllipsis = '...';

export function useClampText({
  text,
  ellipsis = defaultEllipsis,
  lines = 3,
  expanded = false,
  debounceTime = 300,
}) {
  const [{ noClamp, clampedText }, setState] = useState(() => ({
    noClamp: false,
    clampedText: '.',
  }));

  const nodeRef = useRef<HTMLElement | null>();
  const lineHeightRef = useRef(0);

  const clampLines = useCallback(
    ({ lineHeight, originalText, expanded, ellipsis, lines }) => {
      const node = nodeRef.current;
      if (!node) {
        return;
      }
      if (!originalText || expanded) {
        setState({
          noClamp: true,
          clampedText: originalText,
        });
        return;
      }

      const maxHeight = lineHeight * lines + 1;
      const ellipsisLength = defaultEllipsis
        ? 5
        : Math.ceil(ellipsis.length * 1.2);

      let start = 0;
      let middle = 0;
      let end = originalText.length;

      if (!node.clientHeight) {
        return;
      }

      function moveMarkers() {
        const clientHeight = node.clientHeight;
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
          setState({ clampedText: originalText, noClamp: true });
          return;
        }

        moveMarkers();
      }

      const clampedText =
        originalText.slice(0, Math.max(middle - ellipsisLength, 0)).trim() +
        ellipsis;

      node.innerText = clampedText;
      setState({
        noClamp: false,
        clampedText,
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
    })
  );

  useDidMount(() => {
    if (text && !lineHeightRef.current) {
      const lineHeight = nodeRef.current?.clientHeight + 1;
      lineHeightRef.current = lineHeight;
      clampLines({
        lineHeight,
        originalText: text,
        expanded,
        ellipsis,
        lines,
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
    });
  }, [expanded, text]);

  return [
    nodeRef,
    {
      noClamp,
      clampedText,
    },
  ];
}
