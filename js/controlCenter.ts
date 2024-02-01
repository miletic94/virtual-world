class ControlCenter {
  public point: Point;
  public lights: Light[];
  public ticks: number;
  public greenDuration: number;
  public yellowDuration: number;

  constructor(point: Point, greenDuration = 2, yellowDuration = 1) {
    this.point = point;
    this.lights = [];
    this.ticks = 0;
    this.greenDuration = greenDuration;
    this.yellowDuration = yellowDuration;
  }

  addLight(light: Light) {
    this.lights.push(light);
    this.ticks =
      this.lights.length * (this.greenDuration + this.yellowDuration);
  }
}
