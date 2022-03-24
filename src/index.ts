import * as parser from "./parser";
export * as parser from "./parser";
import * as decoder from "./decoder";
export * as decoder from "./decoder";
export * as renderer from "./renderer";

import {
  ByteOrdering,
  ImagePixelDescription,
  ImagePixelTransformation,
} from "./types";
import { TransferSyntax } from "./parser/transferSyntax";

export async function getFrames(
  dataSet: parser.DataSet,
  transferSyntax: TransferSyntax
) {
  const pixelDataElement = dataSet["(7fe0,0010)"];
  const decodeFn = decoder.pixelDecoderForTransferSyntax(transferSyntax.uid);
  if (decodeFn == null) {
    throw Error("No decoder for image.");
  }
  const pixelDescription = getImagePixelDescription(
    dataSet,
    transferSyntax.byteOrdering
  );
  return decodeFn(
    pixelDataElement.value,
    {
      littleEndian: transferSyntax.byteOrdering === "Little Endian",
      implicitVR: transferSyntax.implicitVR,
    },
    pixelDescription
  );
}

export function getImagePixelDescription(
  dataSet: parser.DataSet,
  byteOrdering: ByteOrdering
): ImagePixelDescription {
  // read unsinged short (US)
  function readUS(tag: string): number | undefined {
    if (!dataSet[tag]) return;
    return dataSet[tag].value.getUint16(0, byteOrdering === "Little Endian");
  }

  function readPaletteColorLookupTableDescriptor(
    tag: string
  ): [number, number, number] | undefined {
    if (!dataSet[tag]) return;
    const data = dataSet[tag].value;
    const littleEndian = byteOrdering === "Little Endian";
    return [
      data.getUint16(0, littleEndian),
      data.getUint16(2, littleEndian),
      data.getUint16(4, littleEndian),
    ];
  }

  return {
    samplesPerPixel: readUS("(0028,0002)") || 1, // TODO: throw Error when tag nor present?
    photometricInterpretation: parser.utils
      .decodeString(dataSet["(0028,0004)"].value)
      .trim(),

    rows: readUS("(0028,0010)") || 1, // TODO: throw Error when tag nor present?
    columns: readUS("(0028,0011)") || 1, // TODO: throw Error when tag nor present?

    bitsAllocated: readUS("(0028,0100)") || 8, // TODO: throw Error when tag nor present?
    bitsStored: readUS("(0028,0101)") || 8, // TODO: throw Error when tag nor present?

    pixelRepresentation: readUS("(0028,0103)") || 0, // TODO: throw Error when tag nor present?
    planarConfiguration: readUS("(0028,0006)"),

    smallestValue: readUS("(0028,0106)"),
    largestValue: readUS("(0028,0107)"),

    redPaletteColorLookupTableDescriptor:
      readPaletteColorLookupTableDescriptor("(0028,1101)"),
    greenPaletteColorLookupTableDescriptor:
      readPaletteColorLookupTableDescriptor("(0028,1102)"),
    bluePaletteColorLookupTableDescriptor:
      readPaletteColorLookupTableDescriptor("(0028,1103)"),
    redPaletteColorLookupTableData: dataSet["(0028,1201)"]?.value,
    greenPaletteColorLookupTableData: dataSet["(0028,1202)"]?.value,
    bluePaletteColorLookupTableData: dataSet["(0028,1203)"]?.value,
  };
}

export function getImagePixelTransformation(
  dataSet: parser.DataSet
): ImagePixelTransformation {
  // read decimal string (DS)
  function readDS(tag: string): number | undefined {
    if (!dataSet[tag]) return;
    return parseFloat(parser.utils.decodeString(dataSet[tag].value));
  }

  return {
    windowCenter: readDS("(0028,1050)"),
    windowWidth: readDS("(0028,1051)"),
    rescaleIntercept: readDS("(0028,1052)"),
    rescaleSlope: readDS("(0028,1053)"),
  };
}
