import { BufferAttribute, BufferGeometry } from "three";

/**
 * Custom manuscript-page geometry: a subdivided sheet whose left edge is the "spine".
 * Built by hand (positions / uvs / indices) so the vertex shader can curl it along u.
 */
export function createPageGeometry(
  width = 1.4,
  height = 1.9,
  segmentsX = 32,
  segmentsY = 6,
): BufferGeometry {
  const cols = segmentsX + 1;
  const rows = segmentsY + 1;
  const positions = new Float32Array(cols * rows * 3);
  const uvs = new Float32Array(cols * rows * 2);
  const indices: number[] = [];

  for (let y = 0; y < rows; y++) {
    const v = y / segmentsY;
    for (let x = 0; x < cols; x++) {
      const u = x / segmentsX;
      const i = y * cols + x;
      positions[i * 3] = u * width;
      positions[i * 3 + 1] = (v - 0.5) * height;
      positions[i * 3 + 2] = 0;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }
  }

  for (let y = 0; y < segmentsY; y++) {
    for (let x = 0; x < segmentsX; x++) {
      const a = y * cols + x;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}
