import { Plane, Raycaster, Vector2, Vector3, type Camera } from "three";

/**
 * Shared, allocation-free pointer state written by the render engine and read by scenes
 * inside useFrame. `x`/`y` are window NDC (-1..1); `enabled` is false on touch / coarse
 * pointers and with reduced motion, which switches every scene's mouse interaction off.
 */
export const pointer = {
  x: 0,
  y: 0,
  clientX: -1e5,
  clientY: -1e5,
  speed: 0,
  lastMove: 0,
  enabled: false,
};

export function attachPointer(): () => void {
  const fine = window.matchMedia("(pointer: fine)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => {
    pointer.enabled = fine.matches && !reduce.matches;
  };
  sync();
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const dx = event.clientX - pointer.clientX;
    const dy = event.clientY - pointer.clientY;
    const now = performance.now();
    const dt = Math.max(now - pointer.lastMove, 8);
    pointer.speed = Math.min(
      1,
      Math.max(pointerSpeed(), Math.hypot(dx, dy) / dt / 2.5),
    );
    pointer.lastMove = now;
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
  };
  const onLeave = () => {
    pointer.clientX = pointer.clientY = -1e5;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  fine.addEventListener("change", sync);
  reduce.addEventListener("change", sync);
  return () => {
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    fine.removeEventListener("change", sync);
    reduce.removeEventListener("change", sync);
  };
}

/** Recent pointer speed (0..1), decaying to 0 shortly after the mouse stops. */
export function pointerSpeed(): number {
  return (
    pointer.speed * Math.exp(-(performance.now() - pointer.lastMove) / 220)
  );
}

/** Pointer position relative to one scene slot. */
export interface ScenePointer {
  /** True while the (fine) pointer is over the slot. */
  inside: boolean;
  /** Slot-local NDC (-1..1), matching the View camera's projection. */
  x: number;
  y: number;
  /** Slot width / height, for isotropic screen-space distances. */
  aspect: number;
}

export const createScenePointer = (): ScenePointer => ({
  inside: false,
  x: 0,
  y: 0,
  aspect: 1,
});

export function readScenePointer(
  el: HTMLElement | null,
  out: ScenePointer,
): ScenePointer {
  out.inside = false;
  if (!pointer.enabled || !el) return out;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return out;
  const u = (pointer.clientX - r.left) / r.width;
  const v = (pointer.clientY - r.top) / r.height;
  out.aspect = r.width / r.height;
  out.x = u * 2 - 1;
  out.y = -(v * 2 - 1);
  out.inside = u >= 0 && u <= 1 && v >= 0 && v <= 1;
  return out;
}

const ndc = new Vector2();
const raycaster = new Raycaster();
const plane = new Plane();
const normal = new Vector3();

/**
 * Where the slot pointer meets a plane through `through`: facing the camera by default,
 * or with an explicit world `planeNormal` (e.g. up for a ground plane).
 */
export function pointerOnPlane(
  sp: ScenePointer,
  camera: Camera,
  through: Vector3,
  out: Vector3,
  planeNormal?: Vector3,
): Vector3 | null {
  ndc.set(sp.x, sp.y);
  raycaster.setFromCamera(ndc, camera);
  if (planeNormal) normal.copy(planeNormal);
  else camera.getWorldDirection(normal).negate();
  plane.setFromNormalAndCoplanarPoint(normal, through);
  return raycaster.ray.intersectPlane(plane, out);
}

const projected = new Vector3();
/** Screen-space distance (in slot-height NDC units) between a world point and the pointer. */
export function screenDistance(
  world: Vector3,
  camera: Camera,
  sp: ScenePointer,
): number {
  projected.copy(world).project(camera);
  return Math.hypot((projected.x - sp.x) * sp.aspect, projected.y - sp.y);
}
