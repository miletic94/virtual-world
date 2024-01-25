type Intersection = Point;

class World {
  public envelopes: Envelope[];
  public intersections: Intersection[] = [];
  public roadBorders: Segment[];

  constructor(
    public graph: Graph,
    public roadWidth = 100,
    public roadRoundness = 1
  ) {
    this.graph = graph;
    this.roadWidth = roadWidth;
    this.roadRoundness = roadRoundness;

    this.envelopes = [];
    this.roadBorders = [];

    this.generate();
  }

  generate() {
    this.envelopes.length = 0;
    this.graph.segments.forEach((segment) =>
      this.envelopes.push(
        new Envelope(segment, this.roadWidth, this.roadRoundness)
      )
    );
    this.roadBorders = Polygon.union(
      this.envelopes.map((envelope) => envelope.poly)
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.envelopes.forEach((envelope) =>
      envelope.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 })
    );
    this.graph.segments.forEach((segment) =>
      segment.draw(ctx, { width: 4, color: "white", dash: [10, 10] })
    );
    this.roadBorders.forEach((segment) =>
      segment.draw(ctx, { color: "white", width: 4 })
    );
  }
}
