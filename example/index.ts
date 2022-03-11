import {
  parser,
  renderer,
  getImagePixelDescription,
  getFrames,
} from "../src/index";
import dicomUrl from "url:../test/dicom-files/pydicom/color3d_jpeg_baseline.dcm";

async function onload() {
  const r = await fetch(dicomUrl);
  const buffer = await r.arrayBuffer();

  const dataView = new DataView(buffer, 0, buffer.byteLength);
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
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.setAttribute("style", "border: 1px solid #f0f;");
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  if (context == null) {
    console.error("Failed to create canvas 2d context.");
    return;
  }
  context.putImageData(imageData, 0, 0);
}

void onload();
