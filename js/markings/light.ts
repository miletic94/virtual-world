enum LightState {
  off = "off",
  red = "red",
  yellow = "yellow",
  green = "green",
}

class Light extends Marking {
  public state: LightState;
  public border: Segment;
  constructor(
    center: Point,
    directionVector: Point,
    width: number,
    height: number
  ) {
    super(center, directionVector, width, 18);

    this.state = LightState.green;
    this.border = this.poly.segments[0];
  }

  draw(ctx: CanvasRenderingContext2D) {
    const perp = perpendicular(this.directionVector);
    const line = new Segment(
      add(this.center, scale(perp, this.width / 2)),
      add(this.center, scale(perp, -this.width / 2))
    );

    const green = lerp2D(line.p1, line.p2, 0.2);
    const yellow = lerp2D(line.p1, line.p2, 0.5);
    const red = lerp2D(line.p1, line.p2, 0.8);

    new Segment(red, green).draw(ctx, {
      width: this.height,
      cap: "round",
    });

    green.draw(ctx, { size: this.height * 0.6, color: "#060" });
    yellow.draw(ctx, { size: this.height * 0.6, color: "#660" });
    red.draw(ctx, { size: this.height * 0.6, color: "#600" });

    switch (this.state) {
      case LightState.green:
        green.draw(ctx, { size: this.height * 0.6, color: "#0F0" });
        break;
      case LightState.yellow:
        yellow.draw(ctx, { size: this.height * 0.6, color: "#FF0" });
        break;
      case LightState.red:
        red.draw(ctx, { size: this.height * 0.6, color: "#F00" });
        break;
    }
  }
}
