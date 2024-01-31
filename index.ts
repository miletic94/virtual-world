const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
if (!myCanvas) throw new Error("No canvas found on the page");

const graphBtn = document.getElementById("graphButton");
if (!graphBtn) throw new Error(`No element with id graphButton`);

const stopBtn = document.getElementById("stopButton");
if (!stopBtn) throw new Error(`No element with id stopButton`);

const crossingBtn = document.getElementById("crossingButton");
if (!crossingBtn) throw new Error(`No element with id crossingButton`);

enum GraphMode {
  graph = "graph",
  stop = "stop",
  crossing = "crossing",
}

myCanvas.width = 600;
myCanvas.height = 600;

const ctx = myCanvas.getContext("2d");
if (!ctx) throw new Error("No ctx");

const graphString = localStorage.getItem("graph");
const graphInfo: GraphInfo = graphString ? JSON.parse(graphString) : null;

const graph = graphInfo ? Graph.load(graphInfo) : new Graph();
const world = new World(graph, undefined, 10);

const viewport = new Viewport(myCanvas);

const tools = {
  graph: { button: graphBtn, editor: new GraphEditor(viewport, graph) },
  stop: { button: stopBtn, editor: new StopEditor(viewport, world) },
  crossing: {
    button: crossingBtn,
    editor: new CrossingEditor(viewport, world),
  },
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
  localStorage.setItem("graph", JSON.stringify(graph));
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
