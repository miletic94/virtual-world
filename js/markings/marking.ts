abstract class Marking {
  public center: Point;
  public directionVector: Point;
  public width: number;
  public height: number;
  public support: Segment;
  public poly: Polygon;
  public type!: MarkingEnum;

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

  static load(info: Marking) {
    switch (info.type) {
      case MarkingEnum.CROSSING:
        return new Crossing(
          new Point(info.center.x, info.center.y),
          new Point(info.directionVector.x, info.directionVector.y),
          info.width,
          info.height
        );
      case MarkingEnum.LIGHT:
        return new Light(
          new Point(info.center.x, info.center.y),
          new Point(info.directionVector.x, info.directionVector.y),
          info.width,
          info.height
        );
      case MarkingEnum.PARKING:
        return new Parking(
          new Point(info.center.x, info.center.y),
          new Point(info.directionVector.x, info.directionVector.y),
          info.width,
          info.height
        );
      case MarkingEnum.START:
        return new Start(
          new Point(info.center.x, info.center.y),
          new Point(info.directionVector.x, info.directionVector.y),
          info.width,
          info.height
        );
      case MarkingEnum.STOP:
        return new Stop(
          new Point(info.center.x, info.center.y),
          new Point(info.directionVector.x, info.directionVector.y),
          info.width,
          info.height
        );
      case MarkingEnum.TARGET:
        return new Target(
          new Point(info.center.x, info.center.y),
          new Point(info.directionVector.x, info.directionVector.y),
          info.width,
          info.height
        );
      case MarkingEnum.YIELD:
        return new Yield(
          new Point(info.center.x, info.center.y),
          new Point(info.directionVector.x, info.directionVector.y),
          info.width,
          info.height
        );
    }
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
}
