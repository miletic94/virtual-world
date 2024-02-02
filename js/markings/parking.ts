class Parking extends Marking {
  public borders: Segment[];
  constructor(
    center: Point,
    directionVector: Point,
    width: number,
    height: number
  ) {
    super(center, directionVector, width, height);

    this.type = MarkingEnum.PARKING;
    this.borders = [this.poly.segments[0], this.poly.segments[2]];
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.borders.forEach((b) => b.draw(ctx, { width: 8, color: "white" }));
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(angle(this.directionVector));
    ctx.scale(1, 3);

    ctx.beginPath();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold " + this.height * 0.4 + "px Arial";

    ctx.fillText("P", 0, 1);

    ctx.restore();
  }
}
