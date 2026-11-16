/**
 * Shared, allocation-free pointer state in normalised device coordinates (-1..1),
 * written by the render engine and read by scenes inside useFrame.
 */
export const pointer = { x: 0, y: 0 };

export function attachPointer(): () => void {
  const onMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return () => window.removeEventListener("pointermove", onMove);
}
