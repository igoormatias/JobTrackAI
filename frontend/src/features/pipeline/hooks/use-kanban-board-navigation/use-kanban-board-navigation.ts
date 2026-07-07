"use client";

import { type RefObject, useEffect } from "react";

const isInteractiveTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("[data-kanban-card]") ||
      target.closest("[data-kanban-drag-handle]") ||
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input"),
  );
};

export const useKanbanBoardNavigation = (scrollRef: RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.shiftKey) return;
      event.preventDefault();
      node.scrollLeft += event.deltaY;
    };

    let panning = false;
    let middlePanning = false;
    let startX = 0;
    let startScrollLeft = 0;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button === 1) {
        event.preventDefault();
        middlePanning = true;
        startX = event.clientX;
        startScrollLeft = node.scrollLeft;
        node.setPointerCapture(event.pointerId);
        node.style.cursor = "grabbing";
        return;
      }

      if (event.button !== 0 || isInteractiveTarget(event.target)) return;

      panning = true;
      startX = event.clientX;
      startScrollLeft = node.scrollLeft;
      node.setPointerCapture(event.pointerId);
      node.style.cursor = "grabbing";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!panning && !middlePanning) return;
      const delta = event.clientX - startX;
      node.scrollLeft = startScrollLeft - delta;
    };

    const endPan = (event: PointerEvent) => {
      if (!panning && !middlePanning) return;
      panning = false;
      middlePanning = false;
      node.releasePointerCapture(event.pointerId);
      node.style.cursor = "";
    };

    const handleAuxClick = (event: MouseEvent) => {
      if (event.button === 1) event.preventDefault();
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    node.addEventListener("pointerdown", handlePointerDown);
    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerup", endPan);
    node.addEventListener("pointercancel", endPan);
    node.addEventListener("auxclick", handleAuxClick);

    return () => {
      node.removeEventListener("wheel", handleWheel);
      node.removeEventListener("pointerdown", handlePointerDown);
      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerup", endPan);
      node.removeEventListener("pointercancel", endPan);
      node.removeEventListener("auxclick", handleAuxClick);
    };
  }, [scrollRef]);
};
