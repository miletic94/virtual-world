type EnvelopeDrawOptions = { fill: string; stroke: string; lineWidth: number };

class Envelope {
  public poly: Polygon;
  constructor(public skeleton: Segment, width = 80, roundness = 1) {
    this.skeleton = skeleton;
    this.poly = this.#generatePolygon(width, roundness);
  }

  #generatePolygon(width: number, roundness: number) {
    const { p1, p2 } = this.skeleton;

    const radius = width / 2;
    const alpha = angle(subtract(p1, p2));
    const alpha_cw = alpha + Math.PI / 2;
    const alpha_ccw = alpha - Math.PI / 2;

    const points = [];
    const step = Math.PI / Math.max(1, roundness);
    const eps = step / 2;
    for (let i = alpha_ccw; i < alpha_cw + eps; i += step) {
      points.push(translate(p1, i, radius));
    }

    for (let i = alpha_ccw; i < alpha_cw + eps; i += step) {
      points.push(translate(p2, i + Math.PI, radius));
    }

    return new Polygon(points);
  }

  draw(ctx: CanvasRenderingContext2D, options: EnvelopeDrawOptions) {
    this.poly.draw(ctx, options);
  }
}
