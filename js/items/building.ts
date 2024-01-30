class Building {
  public base: Polygon;
  public heightCoefficient: number;
  constructor(poly: Polygon, heightCoefficient = 0.4) {
    this.base = poly;
    this.heightCoefficient = heightCoefficient;
  }

  draw(ctx: CanvasRenderingContext2D, viewPoint: Point) {
    const topPoints = this.base.points.map((p) =>
      add(p, scale(subtract(p, viewPoint), this.heightCoefficient))
    );
    const ceiling = new Polygon(topPoints);

    const sides: Polygon[] = [];
    for (let i = 0; i < this.base.points.length; i++) {
      const nextI = (i + 1) % this.base.points.length;
      const poly = new Polygon([
        this.base.points[i],
        this.base.points[nextI],
        topPoints[nextI],
        topPoints[i],
      ]);
      sides.push(poly);
    }

    sides.sort((a: Polygon, b: Polygon) => {
      return b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint);
    });

    this.base.draw(ctx, { fill: "white", stroke: "#AAA" });
    sides.forEach((side) => {
      side.draw(ctx, { fill: "white", stroke: "#AAA" });
    });
    ceiling.draw(ctx, { fill: "white", stroke: "#AAA" });
  }
}
