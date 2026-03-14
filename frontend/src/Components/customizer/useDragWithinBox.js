import { useRef } from "react";

/**
 * Keeps element inside a bounding box.
 * Usage:
 * const { bind } = useDragWithinBox({ onMove });
 * <div {...bind()} />
 */
export default function useDragWithinBox({ onMove }) {
  const start = useRef(null);

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = {
      x: e.clientX,
      y: e.clientY,
    };
  }

  function onPointerMove(e) {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = { x: e.clientX, y: e.clientY };
    onMove?.(dx, dy);
  }

  function onPointerUp() {
    start.current = null;
  }

  return {
    bind: () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
    }),
  };
}
