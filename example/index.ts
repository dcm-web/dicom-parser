import {
  parser,
  renderer,
  getImagePixelDescription,
  getFrames,
} from "../src/index";

async function render(dataView: DataView) {
  const { dataSet, transferSyntax } = parser.parse(dataView);
  const decodedFrames = await getFrames(dataSet, transferSyntax);
  const imagePixelDescription = getImagePixelDescription(
    dataSet,
    transferSyntax.byteOrdering
  );
  const imageData = renderer.render(
    decodedFrames[0],
    transferSyntax.byteOrdering,
    imagePixelDescription
  );

  // put the imageData on screen...
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) return;
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext("2d");
  if (context == null) {
    console.error("Failed to create canvas 2d context.");
    return;
  }
  context.putImageData(imageData, 0, 0);
}

function handleDrop(e: DragEvent): void {
  console.log("File(s) dropped");
  e.preventDefault();
  let file;
  if (e.dataTransfer?.items) {
    file = e.dataTransfer.items[0].getAsFile();
  } else if (e.dataTransfer?.files) {
    file = e.dataTransfer.files[0];
  }
  if (file) {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", () => {
      const dataView = new DataView(fileReader.result as ArrayBuffer, 0);
      void render(dataView);
    });
    fileReader.readAsArrayBuffer(file);
  }
}
const dz = document.getElementById("drop_zone");
dz?.addEventListener("drop", handleDrop);
dz?.addEventListener("dragover", (e) => e.preventDefault());
