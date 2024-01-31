class CrossingEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.graph.segments);
  }

  createMarking(center: Point, directionVector: Point): MarkingType {
    return new Crossing(
      center,
      directionVector,
      world.roadWidth,
      this.world.roadWidth / 2
    );
  }
}
