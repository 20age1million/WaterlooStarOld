import { useEffect } from "react";

export function useDraggable(
  ref: React.RefObject<HTMLElement>,
  handleSelector?: string,
  storageKey?: string
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handle = handleSelector
      ? el.querySelector<HTMLElement>(handleSelector)
      : el;
    if (!handle) return;

    // Ensure we move via left/top
    el.style.position = "fixed";
    if (!el.style.left) el.style.left = "24px";
    if (!el.style.top) el.style.top = "24px";
    el.style.willChange = "left, top";

    // Restore saved position
    if (storageKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (
          saved &&
          Number.isFinite(saved.left) &&
          Number.isFinite(saved.top)
        ) {
          el.style.left = saved.left + "px";
          el.style.top = saved.top + "px";
        }
      } catch {}
    }

    const clamp = (v: number, min: number, max: number) =>
      Math.min(Math.max(v, min), max);

    let startX = 0,
      startY = 0,
      startLeft = 0,
      startTop = 0;

    function onPointerDown(e: PointerEvent) {
      handle.setPointerCapture?.(e.pointerId);

      const rect = el.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      // In some UAs, losing capture won’t fire pointerup; this helps cleanup:
      handle.addEventListener("lostpointercapture", onPointerUp, {
        once: true,
      });
    }

    function onPointerMove(e: PointerEvent) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const w = el.offsetWidth,
        h = el.offsetHeight;
      const maxL = window.innerWidth - w;
      const maxT = window.innerHeight - h;

      el.style.left = clamp(startLeft + dx, 0, Math.max(0, maxL)) + "px";
      el.style.top = clamp(startTop + dy, 0, Math.max(0, maxT)) + "px";
    }

    function onPointerUp(e: PointerEvent) {
      handle.releasePointerCapture?.(e.pointerId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      if (storageKey) {
        try {
          const rect = el.getBoundingClientRect();
          localStorage.setItem(
            storageKey,
            JSON.stringify({ left: rect.left, top: rect.top })
          );
        } catch {}
      }
    }

    // Save previous inline styles so we can restore them
    const prevCursor = handle.style.cursor;
    const prevUserSelect = handle.style.userSelect;

    handle.style.cursor = "move";
    handle.style.userSelect = "none";
    handle.addEventListener("pointerdown", onPointerDown);

    // Cleanup — covers unmounts and effect re-runs during a drag
    return () => {
      handle.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      try {
        handle.style.cursor = prevCursor;
        handle.style.userSelect = prevUserSelect;
      } catch {}
    };
  }, [ref, handleSelector, storageKey]);
}
