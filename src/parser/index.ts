import { DataEncoding, DataSet, readDataSet } from "./core";
import * as utils from "./utils";

export function parse(data: DataView): {
  dataSet: DataSet;
  encoding: DataEncoding;
  transferSyntax: string;
} {
  let offset = 128; // skip 128 bytes of file preamble
  const prefix = data.getUint32(offset);
  offset += 4;

  // verify the DICOM prefix bytes to be 44 49 43 4D ("DICM")
  if (prefix !== 0x4449434d) {
    throw Error("Invalid DICOM file - prefix not found.");
  }

  // read Metadata
  const [meta, metaOffsetEnd]: [DataSet, number] = readDataSet(
    data,
    offset,
    { implicitVR: false, littleEndian: true },
    (tag) => (tag.group !== 2 ? "stop" : "continue")
  );
  offset = metaOffsetEnd;

  // read transfer syntax
  let transferSyntax;
  const transferSyntaxDataElement = meta["(0002,0010)"];
  if (transferSyntaxDataElement) {
    const dataLocation = transferSyntaxDataElement.value;
    const transferSyntaxDataView = utils.dataViewAtLocation(data, dataLocation);
    const decoder = new TextDecoder("windows-1252");
    transferSyntax = utils.stringTrimNull(
      decoder.decode(transferSyntaxDataView)
    );
  } else {
    /** Default as defined in {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_10.1 | DICOM Part 5 Section 10.1}. */
    transferSyntax = "1.2.840.10008.1.2";
  }
  const dataEncoding = utils.dataEncodingForTransferSyntax(transferSyntax);

  // read content
  const [content] = readDataSet(data, offset, dataEncoding);

  return {
    dataSet: { ...meta, ...content },
    encoding: dataEncoding,
    transferSyntax,
  };
}
