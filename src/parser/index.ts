import { DataSet, readDataSet } from "./core";
import * as utils from "./utils";

export function parse(data: DataView): DataSet {
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

  // read transfer syntax and set implicitness and endianness accordingly
  let contentImplicitVR = false;
  let contentLittleEndian = true;
  const transferSyntaxDataElement = meta["(0002,0010)"];
  if (transferSyntaxDataElement) {
    const dataLocation = transferSyntaxDataElement.value;
    const transferSyntaxDataView = utils.dataViewAtLocation(data, dataLocation);
    const decoder = new TextDecoder("windows-1252");
    const transferSyntax = utils.stringTrimNull(
      decoder.decode(transferSyntaxDataView)
    );

    if (
      transferSyntax === "1.2.840.10008.1.2" // Implicit VR Little Endian (https://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_A.html)
    ) {
      contentImplicitVR = true;
    } else if (
      transferSyntax === "1.2.840.10008.1.2.2" // Explicit VR Big Endian (https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_A.3.html)
    ) {
      contentLittleEndian = false;
    } else if (
      transferSyntax === "1.2.840.10008.1.2.1.99" || // Deflated Explicit VR Little Endian (https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_A.5.html)
      transferSyntax === "1.2.840.10008.1.2.4.95" // JPIP Referenced Deflate (https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_A.7.html)
    ) {
      throw Error("Deflated transfer syntax is not yet implemented"); // TODO implement
    }
  }

  // read content
  const [content] = readDataSet(data, offset, {
    implicitVR: contentImplicitVR,
    littleEndian: contentLittleEndian,
  });

  return { ...meta, ...content };
}
