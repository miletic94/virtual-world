class Stop extends Marking {
  public border: Segment;
  constructor(
    center: Point,
    directionVector: Point,
    width: number,
    height: number
  ) {
    super(center, directionVector, width, height);

    this.type = MarkingEnum.STOP;
    this.border = this.poly.segments[2];
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.border.draw(ctx, { width: 10, color: "white" });
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(angle(this.directionVector) - Math.PI / 2);
    ctx.scale(1, 3);

    ctx.beginPath();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold " + this.height * 0.3 + "px Arial";

    ctx.fillText("STOP", 0, 1);

    ctx.restore();
  }
}
