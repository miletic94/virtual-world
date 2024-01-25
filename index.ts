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

animate();
function animate() {
  if (!ctx) throw new Error("No ctx");

  viewport.reset();
  world.generate();
  world.draw(ctx);
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
