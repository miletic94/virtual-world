type SegmentDrawOptions = {
  width?: number;
  color?: string;
  dash?: number[];
};

type SegmentInfo = { p1: PointInfo; p2: PointInfo };

class Segment {
  constructor(public p1: Point, public p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  equals(segment: Segment) {
    return this.includes(segment.p1) && this.includes(segment.p2);
  }

  includes(point: Point) {
    return this.p1.equals(point) || this.p2.equals(point);
  }

  directionVector() {
    return normalize(subtract(this.p2, this.p1));
  }

  length() {
    return distance(this.p1, this.p2);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    { width = 2, color = "black", dash = [] }: SegmentDrawOptions = {}
  ) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
