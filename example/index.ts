import { parser, decoder, renderer } from "../src/index";
import dicomUrl from "url:../test/dicom-files/pydicom/OBXXXX1A_2frame.dcm";
import { TransferSyntax } from "../src/parser/transferSyntax";

async function onload() {
  const r = await fetch(dicomUrl);
  const buffer = await r.arrayBuffer();
  const dataView = new DataView(buffer, 0, buffer.byteLength);
  const { dataSet, transferSyntax } = parser.parse(dataView);
  console.log(dataSet, transferSyntax);
  const pixelDataElement = dataSet["(7fe0,0010)"];
  const decodeFn = decoder.pixelDecoderForTransferSyntax(transferSyntax.uid);
  if (decodeFn == null) {
    console.error("No decoder for image.");
    return;
  }
  const decodedFrames = await decodeFn(pixelDataElement.value, {
    littleEndian: transferSyntax.byteOrdering === "Little Endian",
    implicitVR: transferSyntax.implicitVR,
  });
  console.log(decodedFrames);

  const samplesPerPixel = dataSet["(0028,0002)"].value.getUint16(
    0,
    transferSyntax.byteOrdering === "Little Endian"
  );
  const photometricInterpretation = parser.utils
    .decodeString(dataSet["(0028,0004)"].value)
    .trim();

  const planarConfiguration = dataSet["(0028,0006)"]?.value.getUint16(
    0,
    transferSyntax.byteOrdering === "Little Endian"
  );
  const bitsAllocated = dataSet["(0028,0100)"].value.getUint16(
    0,
    transferSyntax.byteOrdering === "Little Endian"
  );
  const bitsStored = dataSet["(0028,0101)"].value.getUint16(
    0,
    transferSyntax.byteOrdering === "Little Endian"
  );
  const pixelRepresentation = dataSet["(0028,0103)"].value.getUint16(
    0,
    transferSyntax.byteOrdering === "Little Endian"
  );
  const smallestValue = dataSet["(0028,0106)"]?.value.getUint16(
    0,
    transferSyntax.byteOrdering === "Little Endian"
  );
  const largestValue = dataSet["(0028,0107)"]?.value.getUint16(
    0,
    transferSyntax.byteOrdering === "Little Endian"
  );

  const windowCenter =
    dataSet["(0028,1050)"] &&
    parseFloat(parser.utils.decodeString(dataSet["(0028,1050)"].value));
  const windowWidth =
    dataSet["(0028,1051)"] &&
    parseFloat(parser.utils.decodeString(dataSet["(0028,1051)"].value));
  const rescaleIntercept =
    dataSet["(0028,1052)"] &&
    parseFloat(parser.utils.decodeString(dataSet["(0028,1052)"].value));
  const rescaleSlope =
    dataSet["(0028,1053)"] &&
    parseFloat(parser.utils.decodeString(dataSet["(0028,1053)"].value));
  const redPaletteColorLookupTableDescriptor =
    dataSet["(0028,1101)"] &&
    getPaletteColorLookupTableDescriptor(
      dataSet["(0028,1101)"].value,
      transferSyntax
    );
  const greenPaletteColorLookupTableDescriptor =
    dataSet["(0028,1102)"] &&
    getPaletteColorLookupTableDescriptor(
      dataSet["(0028,1102)"].value,
      transferSyntax
    );
  const bluePaletteColorLookupTableDescriptor =
    dataSet["(0028,1103)"] &&
    getPaletteColorLookupTableDescriptor(
      dataSet["(0028,1103)"].value,
      transferSyntax
    );
  console.log(
    "Red Palette Color Lookup Table Descriptor",
    redPaletteColorLookupTableDescriptor
  );

  const redPaletteColorLookupTableData = dataSet["(0028,1201)"]?.value;
  const greenPaletteColorLookupTableData = dataSet["(0028,1202)"]?.value;
  const bluePaletteColorLookupTableData = dataSet["(0028,1203)"]?.value;

  const rows = dataSet["(0028,0010)"].value.getUint16(
    0,
    transferSyntax.byteOrdering === "Little Endian"
  );
  const columns = dataSet["(0028,0011)"].value.getUint16(
    0,
    transferSyntax.byteOrdering === "Little Endian"
  );
  console.log(samplesPerPixel, photometricInterpretation);
  console.log(planarConfiguration);
  console.log(bitsAllocated, bitsStored);
  console.log(windowCenter, windowWidth);
  console.log(smallestValue, largestValue);
  console.log(rows, columns);

  const arrayBuffer = new ArrayBuffer(2);
  const uint8Array = new Uint8Array(arrayBuffer);
  const uint16array = new Uint16Array(arrayBuffer);
  uint8Array[0] = 0xaa; // set first byte
  uint8Array[1] = 0xbb; // set second byte
  if (uint16array[0] === 0xbbaa) console.log("little endian");
  if (uint16array[0] === 0xaabb) console.log("big endian");
  console.log(transferSyntax.byteOrdering);

  const imageData = renderer.render(decodedFrames[0], {
    samplesPerPixel,
    planarConfiguration,
    columns,
    rows,
    bitsAllocated,
    bitsStored,
    smallestValue,
    largestValue,
    pixelRepresentation,
    photometricInterpretation,
    windowWidth,
    windowCenter,
    rescaleIntercept,
    rescaleSlope,
    redPaletteColorLookupTableDescriptor,
    greenPaletteColorLookupTableDescriptor,
    bluePaletteColorLookupTableDescriptor,
    redPaletteColorLookupTableData,
    greenPaletteColorLookupTableData,
    bluePaletteColorLookupTableData,
  });

  // put the imageData on screen...
  const canvas = document.createElement("canvas");
  canvas.width = columns;
  canvas.height = rows;
  canvas.setAttribute("style", "border: 1px solid #f0f;");
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  if (context == null) {
    console.error("Failed to create canvas 2d context.");
    return;
  }
  context.putImageData(imageData, 0, 0);
}

onload();

function getPaletteColorLookupTableDescriptor(
  data: DataView,
  transferSyntax: TransferSyntax
): [number, number, number] {
  const littleEndian = transferSyntax.byteOrdering === "Little Endian";
  return [
    data.getUint16(0, littleEndian),
    data.getUint16(2, littleEndian),
    data.getUint16(4, littleEndian),
  ];
}
