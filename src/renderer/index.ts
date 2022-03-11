import { toRGBA } from "./utils";
import { TypedArray } from "../decoder/types"; // move to top level file
import { ByteOrdering } from "../parser/transferSyntax";

export function render(
  frame: Uint8Array,
  byteOrdering: ByteOrdering,
  info: {
    samplesPerPixel: number;
    planarConfiguration: number;
    columns: number;
    rows: number;
    bitsAllocated: number;
    bitsStored: number;
    pixelRepresentation: number;
    photometricInterpretation: string;
    windowWidth?: number;
    windowCenter?: number;
    rescaleIntercept?: number;
    rescaleSlope?: number;
    smallestValue?: number;
    largestValue?: number;
    redPaletteColorLookupTableDescriptor?: [number, number, number];
    greenPaletteColorLookupTableDescriptor?: [number, number, number];
    bluePaletteColorLookupTableDescriptor?: [number, number, number];
    redPaletteColorLookupTableData: DataView;
    greenPaletteColorLookupTableData: DataView;
    bluePaletteColorLookupTableData: DataView;
  }
): ImageData {
  console.log(info);
  console.log("frame", frame);
  const typedPixelData = pixelToTypedArray(frame, byteOrdering, info);
  console.log("typed", typedPixelData);
  const typedPixelDataWithModLut = applyModalityLut(typedPixelData, info);
  console.log("modality LUT", typedPixelDataWithModLut);
  const window = getWindow(info);
  console.log("window", window);
  const arr = applyWindow(typedPixelDataWithModLut, window);
  console.log("window applied", arr);

  const rgba = toRGBA(arr, info);
  return new ImageData(rgba, info.columns, info.rows);
}

enum PixelRepresentation {
  Unsigned,
  Signed,
}
function pixelToTypedArray(
  data: Uint8Array,
  byteOrdering: ByteOrdering,
  info: {
    bitsAllocated: number;
    pixelRepresentation: number;
  }
): TypedArray {
  if (info.bitsAllocated === 1) {
    const out = new Uint8Array(data.byteLength * 8);
    for (let i = 0; i < out.length; i++) {
      const byteOffset = ~~(i / 8); // ~~ is faster than Math.floor
      const bitOffset = i % 8;
      out[i] = (data[byteOffset] >> bitOffset) & 1;
    }
    return out;
  }

  const bytesAllocated = info.bitsAllocated / 8;
  if (data.byteOffset % bytesAllocated !== 0) {
    data = new Uint8Array(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    );
  }

  const nativeByteOrdering = getNativeByteOrdering();
  if (byteOrdering !== nativeByteOrdering) {
    data = swapBytes(data, bytesAllocated);
  }

  if (info.bitsAllocated === 8) {
    if (info.pixelRepresentation === PixelRepresentation.Signed) {
      return new Int8Array(data.buffer, data.byteOffset, data.byteLength);
    } else {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
  }
  if (info.bitsAllocated === 16) {
    if (info.pixelRepresentation === PixelRepresentation.Signed) {
      return new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
    } else {
      return new Uint16Array(data.buffer, data.byteOffset, data.byteLength / 2);
    }
  }
  if (info.bitsAllocated === 32) {
    if (info.pixelRepresentation === PixelRepresentation.Signed) {
      return new Int32Array(data.buffer, data.byteOffset, data.byteLength / 4);
    } else {
      return new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
    }
  }
  throw Error(
    `Unsupported pixel data type with ${info.bitsAllocated} allocated bits.`
  );
}

// https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.html#sect_C.11.1
function applyModalityLut(
  data: TypedArray,
  info: { rescaleIntercept?: number; rescaleSlope?: number }
): TypedArray {
  if (info.rescaleIntercept === undefined || info.rescaleSlope === undefined) {
    return data;
  }
  // applying the modality lut transformation might exceed the type of "data".
  // for now float64 is used - TODO: check actually required bit size of typed array
  const out = new Float64Array(data.length);
  for (let i = 0; i < out.length; i++) {
    const sv = data[i];
    const m = info.rescaleSlope;
    const b = info.rescaleIntercept;
    out[i] = m * sv + b;
  }
  return out;
}

function getWindow(info: {
  windowWidth?: number;
  windowCenter?: number;
  smallestValue?: number;
  largestValue?: number;
  bitsStored: number;
}) {
  if (info.windowWidth !== undefined && info.windowCenter !== undefined) {
    return { width: info.windowWidth, center: info.windowCenter };
  }
  if (info.smallestValue !== undefined && info.largestValue !== undefined) {
    const width = info.largestValue - info.smallestValue;
    return { width, center: width / 2 };
  }
  const width = Math.pow(2, info.bitsStored);
  return { width, center: width / 2 };
}

function applyWindow(
  data: TypedArray,
  window: { width: number; center: number }
): Uint8Array {
  const out = new Uint8Array(data.length);
  const w = window.width - 1;
  const c = window.center - 0.5;
  const ymin = 0;
  const ymax = 255;
  for (let i = 0; i < out.length; i++) {
    const x = data[i];
    let y;
    if (x <= c - w / 2) {
      y = ymin;
    } else if (x > c + w / 2) {
      y = ymax;
    } else {
      y = ((x - c) / w + 0.5) * (ymax - ymin) + ymin;
    }
    out[i] = y;
  }

  return out;
}

function getNativeByteOrdering(): ByteOrdering {
  const arrayBuffer = new ArrayBuffer(2);
  const uint8Array = new Uint8Array(arrayBuffer);
  const uint16array = new Uint16Array(arrayBuffer);
  uint8Array[0] = 0xaa;
  uint8Array[1] = 0xbb;
  if (uint16array[0] === 0xbbaa) return "Little Endian";
  return "Big Endian";
}

function swapBytes(data: Uint8Array, bytes: number): Uint8Array {
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const byte = i % bytes;
    out[i] = data[i + bytes - byte - byte - 1];
  }
  return out;
}
