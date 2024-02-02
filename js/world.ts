type WorldInfo = {
  graph: Graph;
  roadWidth: number;
  roadRoundness: number;
  buildingWidth: number;
  buildingMinLength: number;
  spacing: number;
  treeSize: number;
  envelopes: Envelope[];
  skeleton: Segment;
  poly: Polygon;
  roadBorders: Segment[];
  buildings: Building[];
  trees: Tree[];
  laneGuides: Segment[];
  markings: Marking[];
  zoom: number;
  offset: Point;
};
type Intersection = Point;
type MarkingType = Stop | Crossing | Start | Yield | Parking | Target | Light;
enum MarkingEnum {
  STOP = "stop",
  CROSSING = "crossing",
  START = "start",
  YIELD = "yield",
  PARKING = "parking",
  TARGET = "target",
  LIGHT = "light",
}

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

  public buildings: Building[];

  public trees: Tree[];

  public laneGuides: Segment[];

  public markings: MarkingType[];

  public frameCount: number;

  public zoom: number;
  public offset: Point;

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
    this.buildingWidth = buildingWidth;
    this.buildingMinLength = buildingMinLength;
    this.spacing = spacing;
    this.treeSize = treeSize;

    this.intersections = [];

    this.envelopes = [];
    this.roadBorders = [];

    this.buildings = [];

    this.trees = [];

    this.laneGuides = [];

    this.markings = [];

    this.frameCount = 0;

    (this.zoom = 1), (this.offset = new Point(0, 0));

    this.generate();
  }

  static load(info: WorldInfo) {
    const world = new World(new Graph());
    world.graph = Graph.load(info.graph);
    world.roadWidth = info.roadWidth;
    world.roadRoundness = info.roadRoundness;
    world.buildingWidth = info.buildingWidth;
    world.buildingMinLength = info.buildingMinLength;
    world.spacing = info.spacing;
    world.treeSize = info.treeSize;
    world.envelopes = info.envelopes.map((e) => Envelope.load(e));
    world.roadBorders = info.roadBorders.map(
      (b) => new Segment(new Point(b.p1.x, b.p1.y), new Point(b.p2.x, b.p2.y))
    );
    world.buildings = info.buildings.map((b) => Building.load(b));
    world.trees = info.trees.map((t) => new Tree(t.center, info.treeSize));
    world.laneGuides = info.laneGuides.map(
      (g) => new Segment(new Point(g.p1.x, g.p1.y), new Point(g.p2.x, g.p2.y))
    );
    world.markings = info.markings.map((m) => Marking.load(m));
    world.zoom = info.zoom;
    world.offset = info.offset;
    return world;
  }

  #generateLangGuides() {
    const tempEnvelopes: Envelope[] = [];
    this.graph.segments.forEach((segment) => {
      tempEnvelopes.push(
        new Envelope(segment, this.roadWidth / 2, this.roadRoundness)
      );
    });
    const segments = Polygon.union(tempEnvelopes.map((e) => e.poly));
    return segments;
  }

  #generateBuildings(): Building[] {
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

    return bases.map((b) => new Building(b));
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

    this.laneGuides.length = 0;
    this.laneGuides.push(...this.#generateLangGuides());
  }

  #generateTrees(): Tree[] {
    const points = [
      ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
      ...this.buildings.map((b) => b.base.points).flat(),
    ];

    const left = Math.min(...points.map((p) => p.x));
    const right = Math.max(...points.map((p) => p.x));
    const top = Math.min(...points.map((p) => p.y));
    const bottom = Math.max(...points.map((p) => p.y));

    const illegalPolys = [
      ...this.buildings.map((building) => building.base),
      ...this.envelopes.map((e) => e.poly),
    ];

    const trees: Tree[] = [];
    let tryCount = 0;
    while (tryCount < Math.floor(Math.random() * 80) + 30) {
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
          if (distance(tree.center, p) < this.treeSize) {
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
        trees.push(new Tree(p, this.treeSize));
        tryCount = 0;
      }
      tryCount++;
    }

    return trees;
  }

  #getIntersections() {
    const subset = [];
    for (const point of this.graph.points) {
      let degree = 0;
      for (const seg of this.graph.segments) {
        if (seg.includes(point)) {
          degree++;
        }
      }

      if (degree > 2) {
        subset.push(point);
      }
    }
    return subset;
  }

  #updateLights() {
    const lights: Light[] = this.markings.filter(
      (m) => m instanceof Light
    ) as Light[];
    const controlCenters: ControlCenter[] = [];
    for (const light of lights) {
      const point = getNearestPoint(light.center, this.#getIntersections());
      if (point) {
        let controlCenter: ControlCenter | undefined = controlCenters.find(
          (controlCenter) => controlCenter.point.equals(point)
        );
        if (!controlCenter) {
          controlCenter = new ControlCenter(new Point(point.x, point.y));
          controlCenter.addLight(light);
          controlCenters.push(controlCenter);
        } else {
          controlCenter.addLight(light);
        }
      }
    }

    const tick = Math.floor(this.frameCount / 60);
    for (const center of controlCenters) {
      const cTick = tick % center.ticks;
      const greenYellowIndex = Math.floor(
        cTick / (center.greenDuration + center.yellowDuration)
      );
      const greenYellowState =
        cTick % (center.greenDuration + center.yellowDuration) <
        center.greenDuration
          ? LightState.green
          : LightState.yellow;
      for (let i = 0; i < center.lights.length; i++) {
        if (i == greenYellowIndex) {
          center.lights[i].state = greenYellowState;
        } else {
          center.lights[i].state = LightState.red;
        }
      }
    }
    this.frameCount++;
  }

  draw(ctx: CanvasRenderingContext2D, viewPoint: Point) {
    this.#updateLights();

    this.envelopes.forEach((envelope) =>
      envelope.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 })
    );

    this.markings.forEach((marking) => marking.draw(ctx));

    this.graph.segments.forEach((segment) =>
      segment.draw(ctx, { width: 4, color: "white", dash: [10, 10] })
    );
    this.roadBorders.forEach((segment) =>
      segment.draw(ctx, { color: "white", width: 4 })
    );

    const items = [...this.buildings, ...this.trees];
    items.sort((a: Tree | Building, b: Tree | Building) => {
      return (
        b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint)
      );
    });
    items.forEach((item) => item.draw(ctx, viewPoint));
  }
}
