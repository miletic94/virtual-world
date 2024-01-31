abstract class Marking {
  public center: Point;
  public directionVector: Point;
  public width: number;
  public height: number;
  public support: Segment;
  public poly: Polygon;

  constructor(
    center: Point,
    directionVector: Point,
    width: number,
    height: number
  ) {
    this.center = center;
    this.directionVector = directionVector;
    this.width = width;
    this.height = height;
    this.support = new Segment(
      translate(center, angle(this.directionVector), height / 2),
      translate(center, angle(this.directionVector), -height / 2)
    );
    this.poly = new Envelope(this.support, width, 0).poly;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
}
