type GraphInfo = { points: PointInfo[]; segments: SegmentInfo[] };

class Graph {
  constructor(public points: Point[] = [], public segments: Segment[] = []) {
    this.points = points;
    this.segments = segments;
  }

  hash() {
    return JSON.stringify(this);
  }

  static load(info: GraphInfo): Graph {
    const points = info.points.map((point) => new Point(point.x, point.y));
    const segments = info.segments.map(
      (segment) =>
        new Segment(
          points.find((p) => p.equals(segment.p1 as Point)) as Point,
          points.find((p) => p.equals(segment.p2 as Point)) as Point
        )
    );
    return new Graph(points, segments);
  }

  addPoint(point: Point) {
    this.points.push(point);
  }

  containsPoint(point: Point) {
    return this.points.find((p) => p.equals(point));
  }

  tryAddPoint(point: Point) {
    if (!this.containsPoint(point)) {
      this.addPoint(point);
      return true;
    }
    return false;
  }

  removePoint(point: Point) {
    const segments = this.getSegmentsWithPoint(point);

    for (const segment of segments) {
      this.removeSegment(segment);
    }
    this.points.splice(this.points.indexOf(point), 1);
  }

  addSegment(segment: Segment) {
    this.segments.push(segment);
  }

  containsSegment(segment: Segment) {
    return this.segments.find((s) => s.equals(segment));
  }

  tryAddSegment(segment: Segment) {
    if (this.points.length === 0) {
      console.log("no points");
      return;
    }
    if (!this.containsSegment(segment) && !segment.p1.equals(segment.p2)) {
      this.addSegment(segment);
      return true;
    }
    return false;
  }

  removeSegment(segment: Segment) {
    this.segments.splice(this.segments.indexOf(segment), 1);
  }

  getSegmentsWithPoint(point: Point) {
    const segments = [];
    for (const segment of this.segments) {
      if (segment.includes(point)) {
        segments.push(segment);
      }
    }
    return segments;
  }

  dispose() {
    this.points.length = 0;
    this.segments.length = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const segment of this.segments) {
      segment.draw(ctx);
    }
    for (const point of this.points) {
      point.draw(ctx);
    }
  }
}
