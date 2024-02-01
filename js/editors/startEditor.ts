class StartEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  createMarking(center: Point, directionVector: Point): MarkingType {
    return new Start(
      center,
      directionVector,
      world.roadWidth / 2,
      world.roadWidth / 2
    );
  }
}
