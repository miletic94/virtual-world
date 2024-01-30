const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;

if (!myCanvas) throw new Error("No canvas found on the page");

myCanvas.width = 600;
myCanvas.height = 600;

const ctx = myCanvas.getContext("2d");
if (!ctx) throw new Error("No ctx");

const graphString = localStorage.getItem("graph");
const graphInfo: GraphInfo = graphString ? JSON.parse(graphString) : null;

const graph = graphInfo ? Graph.load(graphInfo) : new Graph();
const world = new World(graph, undefined, 10);
const viewport = new Viewport(myCanvas);
const graphEditor = new GraphEditor(viewport, graph);

let oldGraphHash = graph.hash();
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
  graphEditor.display();

  requestAnimationFrame(animate);
}

function dispose() {
  graphEditor.dispose();
}

function save() {
  localStorage.setItem("graph", JSON.stringify(graph));
}
