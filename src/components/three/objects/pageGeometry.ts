import { BufferAttribute, BufferGeometry } from "three";

export const PAGE_WIDTH = 1.4;
export const PAGE_HEIGHT = 1.9;
export const PAGE_THICKNESS = 0.014;

/**
 * A closed, thick manuscript sheet built by hand: front face, back face and four edge strips.
 * Vertices store their *flat* page coordinates in `aPage` = (s, y, side) where s is the arc
 * length from the spine (x = 0), y is height and side is -1 (back) .. +1 (front). The vertex
 * shader bends the sheet around the spine with a per-instance curvature, so the paper keeps
 * its thickness while it curls. `aEdge` = (nx, ny, isEdge) holds the in-plane edge normal.
 */
export function createPageGeometry(
  width = PAGE_WIDTH,
  height = PAGE_HEIGHT,
  thickness = PAGE_THICKNESS,
  segmentsX = 40,
  segmentsY = 8,
): BufferGeometry {
  const pos: number[] = [];
  const page: number[] = [];
  const edge: number[] = [];
  const uv: number[] = [];
  const index: number[] = [];

  const vertex = (
    s: number,
    y: number,
    side: number,
    nx: number,
    ny: number,
    isEdge: number,
  ) => {
    pos.push(s, y, side * thickness * 0.5);
    page.push(s, y, side);
    edge.push(nx, ny, isEdge);
    uv.push(s / width, y / height + 0.5);
    return pos.length / 3 - 1;
  };

  /** Push a triangle, flipping it if its flat normal disagrees with the intended one. */
  const tri = (
    a: number,
    b: number,
    c: number,
    nx: number,
    ny: number,
    nz: number,
  ) => {
    const p = (i: number) => [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
    const [A, B, C] = [p(a), p(b), p(c)];
    const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
    const v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const cx = u[1] * v[2] - u[2] * v[1];
    const cy = u[2] * v[0] - u[0] * v[2];
    const cz = u[0] * v[1] - u[1] * v[0];
    if (cx * nx + cy * ny + cz * nz >= 0) index.push(a, b, c);
    else index.push(a, c, b);
  };

  // Front (+1) and back (-1) faces.
  for (const side of [1, -1]) {
    const start = pos.length / 3;
    const cols = segmentsX + 1;
    for (let j = 0; j <= segmentsY; j++) {
      for (let i = 0; i <= segmentsX; i++) {
        vertex(
          (i / segmentsX) * width,
          (j / segmentsY - 0.5) * height,
          side,
          0,
          0,
          0,
        );
      }
    }
    for (let j = 0; j < segmentsY; j++) {
      for (let i = 0; i < segmentsX; i++) {
        const a = start + j * cols + i;
        tri(a, a + 1, a + cols + 1, 0, 0, side);
        tri(a, a + cols + 1, a + cols, 0, 0, side);
      }
    }
  }

  // Edge strips: each perimeter run is a ribbon between side -1 and +1.
  const strip = (points: [number, number][], nx: number, ny: number) => {
    const start = pos.length / 3;
    for (const [s, y] of points) {
      vertex(s, y, -1, nx, ny, 1);
      vertex(s, y, 1, nx, ny, 1);
    }
    for (let k = 0; k < points.length - 1; k++) {
      const a = start + k * 2;
      // Use a slightly inflated z so the flip test sees the ribbon's real orientation.
      tri(a, a + 1, a + 3, nx, ny, 0);
      tri(a, a + 3, a + 2, nx, ny, 0);
    }
  };
  const h = height / 2;
  const along = Array.from(
    { length: segmentsX + 1 },
    (_, i) => (i / segmentsX) * width,
  );
  const up = Array.from(
    { length: segmentsY + 1 },
    (_, j) => (j / segmentsY - 0.5) * height,
  );
  strip(
    along.map((s) => [s, -h]),
    0,
    -1,
  );
  strip(
    along.map((s) => [s, h]),
    0,
    1,
  );
  strip(
    up.map((y) => [width, y]),
    1,
    0,
  );
  strip(
    up.map((y) => [0, y]),
    -1,
    0,
  );

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(pos), 3),
  );
  geometry.setAttribute(
    "aPage",
    new BufferAttribute(new Float32Array(page), 3),
  );
  geometry.setAttribute(
    "aEdge",
    new BufferAttribute(new Float32Array(edge), 3),
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uv), 2));
  geometry.setIndex(index);
  geometry.computeBoundingSphere();
  if (geometry.boundingSphere) geometry.boundingSphere.radius *= 1.6;
  return geometry;
}
