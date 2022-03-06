import { parser, decoder } from "../src/index";
import dicomUrl from "url:../test/dicom-files/pydicom/OBXXXX1A_2frame.dcm";

async function onload() {
  const r = await fetch(dicomUrl);
  const buffer = await r.arrayBuffer();
  const dataView = new DataView(buffer, 0, buffer.byteLength);
  const { dataSet, transferSyntax } = parser.parse(dataView);
  console.log(dataSet, transferSyntax);
  const pixelDataElement = dataSet["(7fe0,0010)"];
  const pixelDataView = parser.utils.dataViewAtLocation(
    dataView,
    pixelDataElement.value
  );
  const decodeFn = decoder.pixelDecoderForTransferSyntax(transferSyntax.uid);
  if (decodeFn == null) {
    console.error("No decoder for image.");
    return;
  }
  console.log(pixelDataView);
  const decodedFrames = await decodeFn(pixelDataView, {
    littleEndian: transferSyntax.byteOrdering === "Little Endian",
    implicitVR: transferSyntax.implicitVR,
  });
  console.log(decodedFrames);
}

onload();
