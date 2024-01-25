type PointDrawOptions = {
  size?: number;
  color?: string;
  outline?: boolean;
  fill?: boolean;
  text?: string;
};

type PointInfo = { x: number; y: number };

class Point {
  constructor(public x: number, public y: number) {
    this.x = x;
    this.y = y;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    {
      size = 18,
      color = "black",
      outline = false,
      fill = false,
      text = undefined,
    }: PointDrawOptions = {}
  ) {
    const radius = size / 2;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (outline) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.arc(this.x, this.y, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (fill) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "yellow";
      ctx.fill();
    }

    if (text != undefined) {
      ctx.fillStyle = "red";
      ctx.font = "12px Arial";
      ctx.fillText(text, this.x, this.y);
    }
  }

  equals(point: Point) {
    return this.x == point.x && this.y == point.y;
  }
}
