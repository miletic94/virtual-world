class Target extends Marking {
  constructor(
    center: Point,
    directionVector: Point,
    width: number,
    height: number
  ) {
    super(center, directionVector, width, height);

    this.type = MarkingEnum.TARGET;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.center.draw(ctx, { color: "red", size: 30 });
    this.center.draw(ctx, { color: "white", size: 20 });
    this.center.draw(ctx, { color: "red", size: 10 });
  }
}
