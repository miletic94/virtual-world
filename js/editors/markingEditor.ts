abstract class MarkingEditor {
  public viewport: Viewport;
  public world: World;
  public mouse: Point | null;
  public intent: MarkingType | null;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public markings: MarkingType[];
  public targetSegments: Segment[];

  public boundMouseDown!: (evt: MouseEvent) => void;
  public boundMouseMove!: (evt: MouseEvent) => void;
  public boundContextMenu!: (evt: MouseEvent) => void;
  constructor(viewport: Viewport, world: World, targetSegments: Segment[]) {
    this.viewport = viewport;
    this.world = world;
    this.canvas = viewport.canvas;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.mouse = null;
    this.intent = null;

    this.markings = world.markings;

    this.targetSegments = targetSegments;
  }

  enable() {
    this.#addEventListeners();
  }

  disable() {
    this.#removeEventListeners();
    this.intent = null;
  }

  #addEventListeners() {
    this.boundMouseDown = this.#handleMouseDown.bind(this);
    this.boundMouseMove = this.#handleMouseMove.bind(this);
    this.boundContextMenu = (evt: MouseEvent) => evt.preventDefault();

    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("contextmenu", this.boundContextMenu);
  }

  #removeEventListeners() {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);

    this.canvas.removeEventListener("mousemove", this.boundMouseMove);

    this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
  }

  #handleMouseMove(evt: MouseEvent) {
    this.mouse = this.viewport.getMouse(evt, true);
    const seg = getNearestSegment(
      this.mouse,
      this.targetSegments,
      18 * this.viewport.zoom
    );
    if (seg) {
      const projection = seg.projectPoint(this.mouse);
      if (projection.offset >= 0 && projection.offset <= 1) {
        this.intent = this.createMarking(
          projection.point,
          seg.directionVector()
        );
      } else {
        this.intent = null;
      }
    } else {
      this.intent = null;
    }
  }

  #handleMouseDown(evt: MouseEvent) {
    if (evt.button === 0) {
      if (this.intent) {
        this.markings.push(this.intent);
        this.intent = null;
      }
    }
    if (evt.button === 2) {
      this.markings.forEach((marking, index) => {
        const poly = marking.poly;
        if (poly.containsPoint(this.mouse as Point)) {
          this.markings.splice(index, 1);
          return;
        }
      });
    }
  }

  abstract createMarking(center: Point, directionVector: Point): MarkingType;

  display() {
    if (this.intent) {
      this.intent.draw(this.ctx);
    }
  }
}
