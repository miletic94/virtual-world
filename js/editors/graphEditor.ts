class GraphEditor {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D | null;
  public mouse: Point | null;
  public selected: Point | null;
  public hovered: Point | null;
  public dragging: boolean;
  public boundMouseDown!: (evt: MouseEvent) => void;
  public boundMouseMove!: (evt: MouseEvent) => void;
  public boundMouseUp!: (evt: MouseEvent) => void;
  public boundContextMenu!: (evt: MouseEvent) => void;

  constructor(public viewport: Viewport, public graph: Graph) {
    this.viewport = viewport;
    this.canvas = viewport.canvas;
    this.graph = graph;
    this.ctx = this.canvas.getContext("2d");

    this.mouse = null;

    this.selected = null;
    this.hovered = null;
    this.dragging = false;
  }

  enable() {
    this.#addEventListeners();
  }

  disable() {
    this.#removeEventListeners();
    this.selected = null;
    this.hovered = null;
  }

  #addEventListeners() {
    this.boundMouseDown = this.#handleMouseDown.bind(this);
    this.boundMouseMove = this.#handleMouseMove.bind(this);
    this.boundMouseUp = () => (this.dragging = false);
    this.boundContextMenu = (evt: MouseEvent) => evt.preventDefault();

    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("mouseup", this.boundMouseUp);
    this.canvas.addEventListener("contextmenu", this.boundContextMenu);
  }

  #removeEventListeners() {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);

    this.canvas.removeEventListener("mousemove", this.boundMouseMove);

    this.canvas.removeEventListener("mouseup", this.boundMouseUp);

    this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
  }

  #handleMouseMove(evt: MouseEvent) {
    this.mouse = this.viewport.getMouse(evt, true);
    this.hovered = getNearestPoint(
      this.mouse,
      this.graph.points,
      18 * this.viewport.zoom
    );
    if (this.dragging) {
      if (this.selected) {
        this.selected.x = this.mouse.x;
        this.selected.y = this.mouse.y;
      }
    }
  }

  #handleMouseDown(evt: MouseEvent) {
    if (evt.button == 2) {
      if (this.selected) {
        this.selected = null;
      } else if (this.hovered) {
        this.#removePoint(this.hovered);
      }
    }
    if (evt.button == 0) {
      // Do not draw anything on CTRL + LEFT CLICK
      if (evt.ctrlKey) {
        return;
      }
      if (this.hovered) {
        this.#select(this.hovered);
        this.dragging = true;
        return;
      }
      if (this.mouse) {
        this.graph.tryAddPoint(this.mouse);
        this.#select(this.mouse);
        this.hovered = this.mouse;
      }

      this.dragging = true;
    }
  }

  #removePoint(point: Point) {
    this.graph.removePoint(point);
    if (this.hovered == point) {
      this.hovered = null;
      this.selected = null;
    }
  }

  #select(point: Point) {
    if (this.selected) {
      this.graph.tryAddSegment(new Segment(this.selected, point));
    }
    this.selected = point;
  }

  dispose() {
    this.graph.dispose();
    this.selected = null;
    this.hovered = null;
  }

  display() {
    this.graph.draw(this.ctx as CanvasRenderingContext2D);
    if (this.hovered) {
      this.hovered.draw(this.ctx as CanvasRenderingContext2D, { fill: true });
    }
    if (this.selected) {
      const intent = this.hovered ?? this.mouse;
      new Segment(this.selected, intent as Point).draw(
        this.ctx as CanvasRenderingContext2D,
        { dash: [3, 3] }
      );
      this.selected.draw(this.ctx as CanvasRenderingContext2D, {
        outline: true,
      });
    }
  }
}
