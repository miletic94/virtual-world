const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
if (!myCanvas) throw new Error("No canvas found on the page");

const graphBtn = document.getElementById("graphButton");
if (!graphBtn) throw new Error(`No element with id graphButton`);

const stopBtn = document.getElementById("stopButton");
if (!stopBtn) throw new Error(`No element with id stopButton`);

const crossingBtn = document.getElementById("crossingButton");
if (!crossingBtn) throw new Error(`No element with id crossingButton`);

const startBtn = document.getElementById("startButton");
if (!startBtn) throw new Error(`No element with id startButton`);

const yieldBtn = document.getElementById("yieldButton");
if (!yieldBtn) throw new Error(`No element with id yieldButton`);

const parkingBtn = document.getElementById("parkingButton");
if (!parkingBtn) throw new Error(`No element with id parkingButton`);

const targetBtn = document.getElementById("targetButton");
if (!targetBtn) throw new Error(`No element with id targetButton`);

const lightBtn = document.getElementById("lightButton");
if (!lightBtn) throw new Error(`No element with id lightButton`);

enum GraphMode {
  graph = "graph",
  stop = "stop",
  crossing = "crossing",
}

myCanvas.width = 600;
myCanvas.height = 600;

const ctx = myCanvas.getContext("2d");
if (!ctx) throw new Error("No ctx");

const worldString = localStorage.getItem("world");
const worldInfo = worldString ? JSON.parse(worldString) : null;

let world = worldInfo ? World.load(worldInfo) : new World(new Graph());

const graph = world.graph;

const viewport = new Viewport(myCanvas, world.zoom, world.offset);

const tools = {
  graph: { button: graphBtn, editor: new GraphEditor(viewport, graph) },
  stop: { button: stopBtn, editor: new StopEditor(viewport, world) },
  crossing: {
    button: crossingBtn,
    editor: new CrossingEditor(viewport, world),
  },
  start: {
    button: startBtn,
    editor: new StartEditor(viewport, world),
  },
  yield: {
    button: yieldBtn,
    editor: new YieldEditor(viewport, world),
  },
  parking: { button: parkingBtn, editor: new ParkingEditor(viewport, world) },
  target: { button: targetBtn, editor: new TargetEditor(viewport, world) },
  light: { button: lightBtn, editor: new LightEditor(viewport, world) },
};

let oldGraphHash = graph.hash();

setMode(GraphMode.graph);

animate();
function animate() {
  if (!ctx) throw new Error("No ctx");

  viewport.reset();
  if (graph.hash() !== oldGraphHash) {
    world.generate();
    oldGraphHash = graph.hash();
  }
  const viewPoint = scale(viewport.getOffset(), -1);
  world.draw(ctx, viewPoint);
  ctx.globalAlpha = 0.4;
  for (const tool of Object.values(tools)) {
    tool.editor.display();
  }

  requestAnimationFrame(animate);
}

function dispose() {
  tools["graph"].editor.dispose();
  world.markings.length = 0;
}

function save() {
  world.zoom = viewport.zoom;
  world.offset = viewport.offset;

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(world))
  );

  const fileName = "name.world";
  element.setAttribute("download", fileName);

  element.click();

  localStorage.setItem("world", JSON.stringify(world));
}

function load(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  let file: File | null = null;

  if (files !== null) file = files[0];

  if (!file) {
    alert("No file selected");
    return;
  }

  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (evt: Event) => {
    const fileContent = (evt.target as FileReader).result as string;
    if (!fileContent) {
      alert("File content could not be parsed");
      return;
    }
    const jsonData = JSON.parse(fileContent);
    world = World.load(jsonData);
    localStorage.setItem("world", JSON.stringify(world));
    location.reload();
  };
}

function setMode(mode: GraphMode) {
  disableEditors();

  tools[mode].button.style.backgroundColor = "white";
  tools[mode].button.style.filter = "";
  tools[mode].editor.enable();
}

function disableEditors() {
  for (const tool of Object.values(tools)) {
    if (!tool.button) throw new Error(`No tool button found`);
    tool.button.style.backgroundColor = "gray";
    tool.button.style.filter = "grayscale(100%)";
    tool.editor.disable();
  }
}
