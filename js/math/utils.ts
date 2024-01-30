function getNearestPoint(
  location: Point,
  points: Point[],
  threshold = Number.MAX_SAFE_INTEGER
) {
  let minDistance = Number.MAX_SAFE_INTEGER;
  let nearest = null;
  for (const point of points) {
    const dist = distance(point, location);
    if (dist < minDistance && dist < threshold) {
      minDistance = dist;
      nearest = point;
    }
  }
  return nearest;
}

function distance(p1: Point, p2: Point) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function average(p1: Point, p2: Point) {
  return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}

function add(p1: Point, p2: Point) {
  return new Point(p1.x + p2.x, p1.y + p2.y);
}

function subtract(p1: Point, p2: Point) {
  return new Point(p1.x - p2.x, p1.y - p2.y);
}

function scale(p: Point, scaler: number) {
  return new Point(p.x * scaler, p.y * scaler);
}

function normalize(p: Point) {
  return scale(p, 1 / magnitude(p));
}

function magnitude(p: Point) {
  return Math.hypot(p.x, p.y);
}

function translate(loc: Point, angle: number, offset: number) {
  return new Point(
    loc.x + Math.cos(angle) * offset,
    loc.y + Math.sin(angle) * offset
  );
}

function angle(p: Point) {
  return Math.atan2(p.y, p.x);
}

function toDegrees(angle: number) {
  return (angle * 180) / Math.PI;
}

function toRadian(angle: number) {
  return (angle * Math.PI) / 180;
}

function getIntersection(A: Point, B: Point, C: Point, D: Point) {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (roundNumberToDecimalPlace(bottom, 3) !== 0) {
    const t = roundNumberToDecimalPlace(tTop / bottom, 3); // round number because of JS precision will give something like 0.9999999998 instead of 1.
    const u = roundNumberToDecimalPlace(uTop / bottom, 3);
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
  }

  return null;
}

function dot(p1: Point, p2: Point) {
  return p1.x * p2.x + p1.y * p2.y;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerp2D(A: Point, B: Point, t: number) {
  return new Point(lerp(A.x, B.x, t), lerp(A.y, B.y, t));
}

function getRandomColor() {
  const hue = 290 + Math.random() * 260;
  return "hsl(" + hue + ", 100%, 60%)";
}

function roundNumberToDecimalPlace(number: number, decimalPlaces: number) {
  const decimal = Math.pow(10, decimalPlaces);
  return Math.round(number * decimal) / decimal;
}
