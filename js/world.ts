type Intersection = Point;

class World {
  public envelopes: Envelope[];
  public roadBorders: Segment[];

  public intersections: Intersection[];

  public graph: Graph;
  public roadWidth: number;
  public roadRoundness: number;
  public buildingWidth: number;
  public buildingMinLength: number;
  public spacing: number;

  public treeSize: number;

  public buildings: Polygon[];

  public trees: Point[];

  constructor(
    graph: Graph,
    roadWidth = 100,
    roadRoundness = 10,
    buildingWidth = 150,
    buildingMinLength = 150,
    spacing = 50,
    treeSize = 150
  ) {
    this.graph = graph;
    this.roadWidth = roadWidth;
    this.roadRoundness = roadRoundness;

    this.intersections = [];

    this.envelopes = [];
    this.roadBorders = [];

    this.buildingWidth = buildingWidth;
    this.buildingMinLength = buildingMinLength;
    this.spacing = spacing;

    this.treeSize = treeSize;

    this.buildings = [];

    this.trees = [];

    this.generate();
  }

  #generateBuildings(): Polygon[] {
    const tempEnvelopes: Envelope[] = [];
    this.graph.segments.forEach((segment) => {
      tempEnvelopes.push(
        new Envelope(
          segment,
          this.roadWidth + this.buildingWidth + this.spacing * 2,
          this.roadRoundness
        )
      );
    });
    const guides = Polygon.union(
      tempEnvelopes.map((envelope) => envelope.poly)
    );

    for (let i = 0; i < guides.length; i++) {
      let segment = guides[i];
      if (segment.length() < this.buildingMinLength) {
        guides.splice(i, 1);
        i--;
      }
    }

    const supports: Segment[] = [];
    for (let segment of guides) {
      const len = segment.length() + this.spacing;
      const buildingCount = Math.floor(
        len / (this.buildingMinLength + this.spacing)
      );
      const buildingLength = len / buildingCount - this.spacing;

      const dir = segment.directionVector();

      let q1 = segment.p1;
      let q2 = add(q1, scale(dir, buildingLength));
      supports.push(new Segment(q1, q2));

      for (let i = 2; i <= buildingCount; i++) {
        q1 = add(q2, scale(dir, this.spacing));
        q2 = add(q1, scale(dir, buildingLength));

        supports.push(new Segment(q1, q2));
      }
    }

    const bases: Polygon[] = [];
    supports.forEach((segment) =>
      bases.push(new Envelope(segment, this.buildingWidth).poly)
    );

    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (
          bases[i].intersectsPoly(bases[j]) ||
          roundNumberToDecimalPlace(bases[i].distanceToPoly(bases[j]), 3) <
            this.spacing
        ) {
          bases.splice(j, 1);
          j--;
        }
      }
    }

    return bases;
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
    this.buildings = this.#generateBuildings();
    this.trees = this.#generateTrees();
  }

  #generateTrees(): Point[] {
    const points = [
      ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
      ...this.buildings.map((b) => b.points).flat(),
    ];

    const left = Math.min(...points.map((p) => p.x));
    const right = Math.max(...points.map((p) => p.x));
    const top = Math.min(...points.map((p) => p.y));
    const bottom = Math.max(...points.map((p) => p.y));

    const illegalPolys = [
      ...this.buildings,
      ...this.envelopes.map((e) => e.poly),
    ];

    const trees = [];
    let tryCount = 0;
    while (tryCount < 10) {
      const p = new Point(
        lerp(left, right, Math.random()),
        lerp(bottom, top, Math.random())
      );

      // check if the tree is inside / nearby the building / road
      let keep = true;

      illegalPolys.forEach((poly) => {
        if (
          poly.containsPoint(p) ||
          poly.distanceToPoint(p) < this.treeSize / 2
        ) {
          keep = false;
          return;
        }
      });

      // if tree is too close to other trees
      if (keep) {
        trees.forEach((tree) => {
          if (distance(tree, p) < this.treeSize) {
            keep = false;
            return;
          }
        });
      }

      // avoiding trees in the middle of nowhere
      if (keep) {
        let closeToSomething = false;

        illegalPolys.forEach((poly) => {
          if (poly.distanceToPoint(p) < this.treeSize * 2) {
            closeToSomething = true;
            return;
          }
        });
        keep = closeToSomething;
      }

      if (keep) {
        trees.push(p);
        tryCount = 0;
      }
      tryCount++;
    }

    return trees;
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
    this.buildings.forEach((building) => building.draw(ctx));

    this.trees.forEach((tree) =>
      tree.draw(ctx, { size: this.treeSize, color: "rgba(0,0,0,0.5)" })
    );
  }
}
