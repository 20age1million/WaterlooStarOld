import { useEffect } from "react";

export function useDraggable<T extends HTMLElement>(
  ref:
    | React.RefObject<HTMLElement | null>
    | React.MutableRefObject<HTMLElement | null>,
  handleSelector?: string,
  storageKey?: string
) {
  useEffect(() => {
    const el = ref.current as HTMLElement | null;
    if (!el) return;

    const handle = handleSelector
      ? el.querySelector<HTMLElement>(handleSelector)
      : el;
    if (!handle) return;
    const h = handle; // freeze non-null for the closures below

    // positioning & perf hints
    el.style.position = "fixed";
    if (!el.style.left) el.style.left = "24px";
    if (!el.style.top) el.style.top = "24px";
    el.style.willChange = "left, top";

    // make dragging feel right
    h.style.cursor = "move";
    h.style.userSelect = "none";
    (h.style as any).touchAction = "none";

    // restore saved position
    if (storageKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (
          saved &&
          Number.isFinite(saved.left) &&
          Number.isFinite(saved.top)
        ) {
          el.style.left = `${saved.left}px`;
          el.style.top = `${saved.top}px`;
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
      h.setPointerCapture?.(e.pointerId);

      const rect = el.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      h.addEventListener("lostpointercapture", onPointerUp, { once: true });
    }

    function onPointerMove(e: PointerEvent) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const maxL = Math.max(0, window.innerWidth - el.offsetWidth);
      const maxT = Math.max(0, window.innerHeight - el.offsetHeight);
      el.style.left = clamp(startLeft + dx, 0, maxL) + "px";
      el.style.top = clamp(startTop + dy, 0, maxT) + "px";
    }

    function onPointerUp(e: PointerEvent) {
      h.releasePointerCapture?.(e.pointerId);
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

    h.addEventListener("pointerdown", onPointerDown);

    return () => {
      h.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      try {
        h.style.cursor = "";
        h.style.userSelect = "";
      } catch {}
    };
  }, [ref, handleSelector, storageKey]);
}
