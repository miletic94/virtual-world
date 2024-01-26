type PolygonDrawOptions = {
  stroke?: string;
  lineWidth?: number;
  fill?: string;
};

class Polygon {
  segments: Segment[] = [];
  constructor(public points: Point[]) {
    this.points = points;
    this.segments = [];
    for (let i = 1; i <= points.length; i++) {
      this.segments.push(new Segment(points[i - 1], points[i % points.length]));
    }
  }

  static union(polygons: Polygon[]) {
    Polygon.multiBreak(polygons);
    const keepSegments = [];
    for (let i = 0; i < polygons.length; i++) {
      for (const segment of polygons[i].segments) {
        let keep = true;
        for (let j = 0; j < polygons.length; j++) {
          if (i !== j) {
            if (polygons[j].containsSegment(segment)) {
              keep = false;
              break;
            }
          }
        }
        if (keep) {
          keepSegments.push(segment);
        }
      }
    }
    return keepSegments;
  }

  static multiBreak(polygons: Polygon[]) {
    for (let i = 0; i < polygons.length - 1; i++) {
      for (let j = i + 1; j < polygons.length; j++) {
        Polygon.break(polygons[i], polygons[j]);
      }
    }
  }

  static break(poly1: Polygon, poly2: Polygon) {
    const segments1 = poly1.segments;
    const segments2 = poly2.segments;

    for (let i = 0; i < segments1.length; i++) {
      for (let j = 0; j < segments2.length; j++) {
        const intersection = getIntersection(
          segments1[i].p1,
          segments1[i].p2,
          segments2[j].p1,
          segments2[j].p2
        );

        if (
          intersection &&
          intersection.offset !== 1 &&
          intersection.offset !== 0
        ) {
          const point = new Point(intersection.x, intersection.y);

          let aux = segments1[i].p2;
          segments1[i].p2 = point;
          segments1.splice(i + 1, 0, new Segment(point, aux));

          aux = segments2[j].p2;
          segments2[j].p2 = point;
          segments2.splice(i + 1, 0, new Segment(point, aux));
        }
      }
    }
  }

  containsSegment(segment: Segment) {
    const midpoint = average(segment.p1, segment.p2);
    return this.containsPoint(midpoint);
  }

  intersectsPoly(poly: Polygon) {
    for (let segments1 of this.segments) {
      for (let segments2 of poly.segments) {
        if (
          getIntersection(
            segments1.p1,
            segments1.p2,
            segments2.p1,
            segments2.p2
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }

  containsPoint(point: Point) {
    const outerPoint = new Point(point.x - 1000, point.y - 1000);
    let intersectionCount = 0;
    for (const segment of this.segments) {
      const intersection = getIntersection(
        outerPoint,
        point,
        segment.p1,
        segment.p2
      );
      if (intersection) {
        intersectionCount++;
      }
    }
    return intersectionCount % 2 === 1;
  }

  drawSegments(ctx: CanvasRenderingContext2D) {
    this.segments.forEach((segment) =>
      segment.draw(ctx, { color: "red", width: 5 })
    );
  }

  draw(
    ctx: CanvasRenderingContext2D,
    {
      stroke = "blue",
      lineWidth = 2,
      fill = "rgba(0, 0, 255, 0.3)",
    }: PolygonDrawOptions = {} as PolygonDrawOptions
  ) {
    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
