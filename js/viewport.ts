type Pan = {
  start: Point;
  end: Point;
  offset: Point;
  active: boolean;
};

class Viewport {
  public ctx: CanvasRenderingContext2D;
  public zoom: number;
  public center: Point;
  public offset: Point;
  public pan: Pan;
  constructor(
    public canvas: HTMLCanvasElement,
    zoom = 1,
    offset = new Point(0, 0)
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    this.zoom = zoom;
    this.center = new Point(canvas.width / 2, canvas.height / 2);
    this.offset = offset ? offset : scale(this.center, -1);

    this.pan = {
      start: new Point(0, 0),
      end: new Point(0, 0),
      offset: new Point(0, 0),
      active: false,
    };

    this.#addEventListeners();
  }

  reset() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.scale(1 / this.zoom, 1 / this.zoom);
    const offset = this.getOffset();
    this.ctx.translate(offset.x, offset.y);
  }

  getMouse(evt: MouseEvent, subtractPanOffset = false) {
    const p = new Point(
      (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
      (evt.offsetY - this.center.y) * this.zoom - this.offset.y
    );

    return subtractPanOffset ? subtract(p, this.pan.offset) : p;
  }

  getOffset() {
    return add(this.offset, this.pan.offset);
  }

  #addEventListeners() {
    this.canvas.addEventListener("wheel", this.#handleMouseWheel.bind(this));
    this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
  }
  #handleMouseUp(evt: MouseEvent) {
    if (this.pan.active) {
      this.offset = add(this.offset, this.pan.offset);
      this.pan = {
        start: new Point(0, 0),
        end: new Point(0, 0),
        offset: new Point(0, 0),
        active: false,
      };
    }
  }
  #handleMouseMove(evt: MouseEvent) {
    if (this.pan.active) {
      this.pan.end = this.getMouse(evt);
      this.pan.offset = subtract(this.pan.end, this.pan.start);
    }
  }
  #handleMouseDown(evt: MouseEvent) {
    if (evt.button === 0) {
      if (evt.ctrlKey) {
        this.pan.start = this.getMouse(evt);
        this.pan.active = true;
      }
    }
  }
  #handleMouseWheel(evt: WheelEvent) {
    const dir = Math.sign(evt.deltaY);
    const step = 0.1;
    this.zoom += dir * step;
    this.zoom = Math.max(1, Math.min(5, this.zoom));
  }
}
