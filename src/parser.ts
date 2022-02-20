export function parse(data: DataView): DataSet {
  let offset = 128; // skip 128 bytes of file preamble
  const prefix = data.getUint32(offset);
  offset += 4;

  // verify the DICOM prefix bytes to be 44 49 43 4D ("DICM")
  if (prefix !== 0x4449434d) {
    throw Error("Invalid DICOM file - prefix not found.");
  }

  // read Metadata
  const [meta, metaOffsetEnd] = readDataSet(
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
    const transferSyntaxDataView = dataViewAtLocation(data, dataLocation);
    const decoder = new TextDecoder("windows-1252");
    const transferSyntax = stringTrimNull(
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

type ParseOptions = {
  implicitVR: boolean;
  littleEndian: boolean;
};

type DataElement = {
  tag: Tag;
  vr: string | null;
  value: DataLocation;
};
type DataSet = Record<string, DataElement>;

type ParseStopOption =
  | "continue"
  | "stop"
  | "stopAndIncludeOffset"
  | "stopAndIncludeElement";
type ParseStopCondition = (tag: Tag) => ParseStopOption;

export function readSequenceItems(
  data: DataView,
  offsetStart: number,
  options: ParseOptions
): [DataSet, number] {
  const stopCondition = (tag: Tag) => {
    const isSequenceEnd = equalTag(tag, SequenceDelimitationItemTag);
    if (!isSequenceEnd && !equalTag(tag, ItemTag)) {
      console.warn(`Expected ItemTag but found tag "${tagToString(tag)}".`);
    }
    return isSequenceEnd ? "stopAndIncludeOffset" : "continue";
  };
  return readDataSet(data, offsetStart, options, stopCondition);
}

/**
 * Parse a DataSet from a DataView.
 *
 * @param data - The DataView to read from.
 * @param offsetStart - The offset in the data to start reading at.
 * @param options - Options regarding endianness and VR implicitness.
 * @param stopCondition - Optional callback to stop the parsing (and include or discard the current dataElement and offset) when its tag meets a certain condition.
 * @returns The parsed DataSet and the current offset in the data.
 */
function readDataSet(
  data: DataView,
  offsetStart: number,
  options: ParseOptions,
  stopCondition?: ParseStopCondition
): [DataSet, number] {
  const elements: DataSet = {};
  let offset = offsetStart;
  while (offset < data.byteLength) {
    const [element, offsetEnd] = readDataElement(data, offset, options);
    const stopOption = stopCondition && stopCondition(element.tag);
    if (stopOption && stopOption === "stop") break; // stop before current element
    offset = offsetEnd;
    if (stopOption && stopOption === "stopAndIncludeOffset") break; // include the offset but discard the current element
    elements[tagToString(element.tag)] = element;
    if (stopOption && stopOption === "stopAndIncludeElement") break; // include the current element
  }
  return [elements, offset];
}

function readDataElement(
  data: DataView,
  offsetStart: number,
  options: ParseOptions
): [DataElement, number] {
  let offset = offsetStart;

  // read Tag
  const tag = {
    group: data.getUint16(offset, options.littleEndian),
    element: data.getUint16(offset + 2, options.littleEndian),
  };
  offset = offset + 4;

  // read VR
  let vr: VR | null = null;
  if (!options.implicitVR && !tagHasImplicitVR(tag)) {
    vr = getVR(data, offset);
    offset += 2;
    if (!vr) {
      console.warn("No Explicit VR found and implicit option was not set.");
      offset -= 2;
    }
  }

  // read length
  let length: number;
  if (!vr) {
    // Implicit VR Format: TAG, 4-byte length, value
    length = data.getUint32(offset, options.littleEndian);
    offset += 4;
  } else if (dataVR.includes(vr)) {
    // Explicit Data VR Format: TAG, VR, 2-bytes reserved, 4-byte length, value
    offset += 2; // skip reserved bytes
    length = data.getUint32(offset, options.littleEndian);
    offset += 4;
  } else {
    // Explicit VR Format: TAG, VR, 2-byte length, value
    length = data.getUint16(offset, options.littleEndian);
    offset += 2;
  }

  // read value
  let value: DataLocation;

  if (length != 0xffffffff) {
    value = { offset, length };
    return [{ tag, vr, value }, offset + length];
  }

  if (equalTag(tag, ItemTag)) {
    const [, offsetEnd] = readDataSet(data, offset, options, (tag) =>
      equalTag(tag, ItemDelimitationItemTag)
        ? "stopAndIncludeOffset"
        : "continue"
    );
    value = { offset, length: offsetEnd - offset };
    return [{ tag, vr, value }, offsetEnd];
  }

  if (equalTag(tag, PixelDataTag)) {
    value = { offset, length: data.byteLength - offset };
    return [{ tag, vr, value }, data.byteLength];
  }

  const [, offsetEnd] = readSequenceItems(data, offset, options);
  value = { offset, length: offsetEnd - offset };
  return [{ tag, vr, value }, offsetEnd];
}

// -- VR --
// https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html
// prettier-ignore
const VRs = [
  'AE', 'AS', 'AT', 'CS', 'DA', 'DS', 'DT',
  'FD', 'FL', 'IS', 'LO', 'LT', 'OB', 'OD',
  'OF', 'OW', 'PN', 'SH', 'SL', 'SQ', 'SS',
  'ST', 'TM', 'UI', 'UL', 'UN', 'US', 'UT'
]as const;
type VR = typeof VRs[number];
const dataVR: VR[] = ["OB", "OW", "OF", "SQ", "UT", "UN"];

/**
 * Read a VR from a DataView
 *
 * @param data - The DataView to read from
 * @param offset - The offset to read at
 * @returns The VR if a valid VR was read, null otherwise.
 */
function getVR(data: DataView, offset: number): VR | null {
  const vrString =
    String.fromCharCode(data.getUint8(offset)) +
    String.fromCharCode(data.getUint8(offset + 1));
  return VRs.find((_vr) => _vr === vrString) || null;
}

// -- Tag --
type Tag = { group: number; element: number };
const ItemTag: Tag = { group: 0xfffe, element: 0xe000 };
const ItemDelimitationItemTag: Tag = { group: 0xfffe, element: 0xe00d };
const SequenceDelimitationItemTag: Tag = { group: 0xfffe, element: 0xe0dd };
const PixelDataTag: Tag = { group: 0x7fe0, element: 0x0010 };

function equalTag(tagA: Tag, tagB: Tag) {
  return tagA.group === tagB.group && tagA.element === tagB.element;
}

function tagToString(tag: Tag) {
  const toPaddedHex = (n: number) => n.toString(16).padStart(4, "0");
  return `(${toPaddedHex(tag.group)},${toPaddedHex(tag.element)})`;
}

function tagHasImplicitVR(tag: Tag) {
  // these Tags always use implicit VR (see DICOM part 05 section 7.5)
  return (
    equalTag(tag, ItemTag) ||
    equalTag(tag, ItemDelimitationItemTag) ||
    equalTag(tag, SequenceDelimitationItemTag)
  );
}

// -- DataLocation --
type DataLocation = { offset: number; length: number };
export function dataViewAtLocation(
  data: DataView,
  dataLocation: DataLocation
): DataView {
  return new DataView(
    data.buffer,
    data.byteOffset + dataLocation.offset,
    dataLocation.length
  );
}

// -- Utils --
/**
 * Trim trailing null characters (\\0) from a string.
 *
 * @param str - String to trim the trailing null characters of.
 * @returns Trimmed string.
 */
function stringTrimNull(str: string) {
  let nullChars = 0;
  while (str.charAt(str.length - 1 - nullChars) === "\0") {
    nullChars++;
  }
  return str.slice(0, -nullChars);
}
