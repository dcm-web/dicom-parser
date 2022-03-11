import { DataSet, readDataSet } from "./core";
export { DataSet } from "./core";
import { TransferSyntax, transferSyntaxFromUid } from "./transferSyntax";
import * as utils from "./utils";
export * as utils from "./utils";

export function parse(data: DataView): {
  dataSet: DataSet;
  transferSyntax: TransferSyntax;
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
  let transferSyntaxUid;
  const transferSyntaxDataElement = meta["(0002,0010)"];
  if (transferSyntaxDataElement) {
    transferSyntaxUid = utils.stringTrimNull(
      utils.decodeString(transferSyntaxDataElement.value)
    );
  } else {
    /** Default as defined in {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_10.1 | DICOM Part 5 Section 10.1}. */
    transferSyntaxUid = "1.2.840.10008.1.2";
  }
  const transferSyntax = transferSyntaxFromUid(transferSyntaxUid);

  // read content
  const [content] = readDataSet(data, offset, {
    littleEndian: transferSyntax.byteOrdering === "Little Endian",
    implicitVR: transferSyntax.implicitVR,
  });

  return {
    dataSet: { ...meta, ...content },
    transferSyntax,
  };
}
