import { Path, Shape } from "three";

/**
 * Extrudable 2D glyphs for the project universe (one per project slug), roughly 1 unit tall.
 * Custom outlines instead of primitives so each project reads as its own object.
 */
const shield = () => {
  const s = new Shape();
  s.moveTo(0, 0.62);
  s.bezierCurveTo(0.22, 0.5, 0.42, 0.48, 0.5, 0.48);
  s.bezierCurveTo(0.5, 0.05, 0.4, -0.35, 0, -0.62);
  s.bezierCurveTo(-0.4, -0.35, -0.5, 0.05, -0.5, 0.48);
  s.bezierCurveTo(-0.42, 0.48, -0.22, 0.5, 0, 0.62);
  const hole = new Path();
  hole.moveTo(0, 0.4);
  hole.bezierCurveTo(0.15, 0.32, 0.28, 0.31, 0.32, 0.31);
  hole.bezierCurveTo(0.32, 0.02, 0.25, -0.22, 0, -0.4);
  hole.bezierCurveTo(-0.25, -0.22, -0.32, 0.02, -0.32, 0.31);
  hole.bezierCurveTo(-0.28, 0.31, -0.15, 0.32, 0, 0.4);
  s.holes.push(hole);
  return [s];
};

const docFrame = () => {
  const s = new Shape();
  s.moveTo(-0.38, -0.5);
  s.lineTo(0.38, -0.5);
  s.lineTo(0.38, 0.28);
  s.lineTo(0.16, 0.5);
  s.lineTo(-0.38, 0.5);
  s.closePath();
  for (let i = 0; i < 3; i++) {
    const h = new Path();
    const y = 0.12 - i * 0.2;
    h.moveTo(-0.24, y);
    h.lineTo(0.24, y);
    h.lineTo(0.24, y - 0.07);
    h.lineTo(-0.24, y - 0.07);
    h.closePath();
    s.holes.push(h);
  }
  return [s];
};

const square = (x: number, y: number, w: number) => {
  const s = new Shape();
  s.moveTo(x, y);
  s.lineTo(x + w, y);
  s.lineTo(x + w, y + w);
  s.lineTo(x, y + w);
  s.closePath();
  return s;
};

const dataGrid = () => {
  const shapes: Shape[] = [];
  const heights = [0.35, 0.7, 0.5, 0.95];
  heights.forEach((h, i) => {
    const s = new Shape();
    const x = -0.46 + i * 0.25;
    s.moveTo(x, -0.5);
    s.lineTo(x + 0.17, -0.5);
    s.lineTo(x + 0.17, -0.5 + h);
    s.lineTo(x, -0.5 + h);
    s.closePath();
    shapes.push(s);
  });
  return shapes;
};

const cloud = () => {
  const s = new Shape();
  s.moveTo(-0.45, -0.25);
  s.lineTo(0.42, -0.25);
  s.absarc(0.38, -0.02, 0.23, -Math.PI / 2, Math.PI * 0.55, false);
  s.absarc(0.05, 0.12, 0.3, Math.PI * 0.05, Math.PI * 0.95, false);
  s.absarc(-0.36, -0.03, 0.22, Math.PI * 0.45, Math.PI * 1.5, false);
  s.closePath();
  return [s];
};

const bubble = () => {
  const s = new Shape();
  const w = 0.5;
  const h = 0.36;
  const r = 0.12;
  s.moveTo(-w + r, -h);
  s.lineTo(-0.1, -h);
  s.lineTo(-0.28, -h - 0.2);
  s.lineTo(-0.24, -h);
  s.lineTo(w - r, -h);
  s.quadraticCurveTo(w, -h, w, -h + r);
  s.lineTo(w, h - r);
  s.quadraticCurveTo(w, h, w - r, h);
  s.lineTo(-w + r, h);
  s.quadraticCurveTo(-w, h, -w, h - r);
  s.lineTo(-w, -h + r);
  s.quadraticCurveTo(-w, -h, -w + r, -h);
  return [s];
};

const brackets = () => {
  const chevron = (dir: 1 | -1) => {
    const s = new Shape();
    const x = dir * 0.2;
    s.moveTo(x, 0.42);
    s.lineTo(x + dir * 0.3, 0);
    s.lineTo(x, -0.42);
    s.lineTo(x + dir * 0.12, -0.42);
    s.lineTo(x + dir * 0.42, 0);
    s.lineTo(x + dir * 0.12, 0.42);
    s.closePath();
    return s;
  };
  const slash = square(-0.05, -0.45, 0.1);
  return [chevron(1), chevron(-1), slash];
};

export const projectGlyphs: Record<string, () => Shape[]> = {
  "myx-ai": shield,
  "docuscan-ocr": docFrame,
  "python-data-cleaning": dataGrid,
  "weather-application": cloud,
  "ai-assistant": bubble,
  "frontend-development-collection": brackets,
};
