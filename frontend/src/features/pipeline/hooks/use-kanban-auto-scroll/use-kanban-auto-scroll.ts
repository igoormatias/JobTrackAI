"use client";

import { type RefObject, useEffect } from "react";

const EDGE_SIZE = 120;
const MAX_SPEED = 36;

export const useKanbanAutoScroll = (
  scrollRef: RefObject<HTMLDivElement | null>,
  isDragging: boolean,
) => {
  useEffect(() => {
    if (!isDragging) return;

    const scrollNode = scrollRef.current;
    if (!scrollNode) return;

    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };

    const tick = () => {
      const rect = scrollNode.getBoundingClientRect();
      const distanceLeft = pointerX - rect.left;
      const distanceRight = rect.right - pointerX;

      if (distanceLeft < EDGE_SIZE && distanceLeft >= 0) {
        const intensity = (EDGE_SIZE - distanceLeft) / EDGE_SIZE;
        scrollNode.scrollLeft -= MAX_SPEED * intensity;
      } else if (distanceRight < EDGE_SIZE && distanceRight >= 0) {
        const intensity = (EDGE_SIZE - distanceRight) / EDGE_SIZE;
        scrollNode.scrollLeft += MAX_SPEED * intensity;
      }

      const columnBodies = scrollNode.querySelectorAll<HTMLElement>("[data-kanban-column-body]");
      for (const columnBody of columnBodies) {
        const columnRect = columnBody.getBoundingClientRect();
        if (pointerX < columnRect.left || pointerX > columnRect.right) continue;
        if (pointerY < columnRect.top || pointerY > columnRect.bottom) continue;

        const distanceTop = pointerY - columnRect.top;
        const distanceBottom = columnRect.bottom - pointerY;

        if (distanceTop < EDGE_SIZE) {
          const intensity = (EDGE_SIZE - distanceTop) / EDGE_SIZE;
          columnBody.scrollTop -= MAX_SPEED * intensity;
        } else if (distanceBottom < EDGE_SIZE) {
          const intensity = (EDGE_SIZE - distanceBottom) / EDGE_SIZE;
          columnBody.scrollTop += MAX_SPEED * intensity;
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handlePointerMove);
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(frameId);
    };
  }, [isDragging, scrollRef]);
};
