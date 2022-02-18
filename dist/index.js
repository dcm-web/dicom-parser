"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
function parse(data) {
    let offset = 128; // skip 128 bytes of file preamble
    const prefix = data.getUint32(offset);
    offset += 4;
    // verify the DICOM prefix bytes to be 44 49 43 4D ("DICM")
    if (prefix !== 0x4449434d) {
        throw Error("Invalid DICOM file - signature not found.");
    }
    // read Metadata
    const [meta, metaOffsetEnd] = readDataElementRecord(data, offset, { implicitVR: false, littleEndian: true }, ({ group }) => group !== 2);
    offset = metaOffsetEnd;
    console.log(meta);
    // read transfer syntax and set implicitness and endianness accordingly
    let contentImplicitVR = false;
    let contentLittleEndian = true;
    const transferSyntaxDataElement = meta["(0002,0010)"];
    if (transferSyntaxDataElement) {
        const dataLocation = transferSyntaxDataElement.value;
        const transferSyntaxDataView = new DataView(data.buffer, data.byteOffset + dataLocation.offset, dataLocation.length);
        const decoder = new TextDecoder("windows-1252");
        const transferSyntax = stringTrimNull(decoder.decode(transferSyntaxDataView));
        console.debug(`transfer Syntax: ${transferSyntax}"`);
        if (transferSyntax === "1.2.840.10008.1.2" // Implicit VR Little Endian (https://dicom.nema.org/dicom/2013/output/chtml/part05/chapter_A.html)
        ) {
            contentImplicitVR = true;
        }
        else if (transferSyntax === "1.2.840.10008.1.2.2" // Explicit VR Big Endian (https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_A.3.html)
        ) {
            contentLittleEndian = false;
        }
        else if (transferSyntax === "1.2.840.10008.1.2.1.99" || // Deflated Explicit VR Little Endian (https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_A.5.html)
            transferSyntax === "1.2.840.10008.1.2.4.95" // JPIP Referenced Deflate (https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_A.7.html)
        ) {
            throw Error("Deflated transfer syntax is not yet implemented"); // TODO implement
        }
    }
    // read content
    const [content] = readDataElementRecord(data, offset, {
        implicitVR: contentImplicitVR,
        littleEndian: contentLittleEndian,
    });
    console.log(Object.values(content).map((d) => `${tagToString(d.tag)} ${d.vr || "--"} (${d.value.length})`));
    return Object.assign(Object.assign({}, meta), content);
}
exports.parse = parse;
function readDataElementRecord(data, offsetStart, options, stopCondition) {
    const elements = {};
    let offset = offsetStart;
    while (offset < data.byteLength) {
        const [element, offsetEnd] = readDataElement(data, offset, options);
        if (stopCondition && stopCondition(element.tag)) {
            break;
        }
        elements[tagToString(element.tag)] = element;
        offset = offsetEnd;
    }
    return [elements, offset];
}
function readDataElement(data, offsetStart, options) {
    let offset = offsetStart;
    // read Tag
    const tag = {
        group: data.getUint16(offset, options.littleEndian),
        element: data.getUint16(offset + 2, options.littleEndian),
    };
    offset = offset + 4;
    // read VR
    let vr = null;
    if (!isImplicitVR(options, tag)) {
        vr = getVR(data, offset);
        offset += 2;
        if (!vr) {
            console.warn("Implicit VR found but option was not set.");
            offset -= 2;
        }
    }
    // read length
    let length;
    if (!vr) {
        // Implicit VR Format: TAG, 4-byte length, value
        length = data.getUint32(offset, options.littleEndian);
        offset += 4;
    }
    else if (dataVR.includes(vr)) {
        // Explicit Data VR Format: TAG, VR, 2-bytes reserved, 4-byte length, value
        offset += 2; // skip reserved bytes
        length = data.getUint32(offset, options.littleEndian);
        offset += 4;
    }
    else {
        // Explicit VR Format: TAG, VR, 2-byte length, value
        length = data.getUint16(offset, options.littleEndian);
        offset += 2;
    }
    // read value
    let value;
    if (length != 0xffffffff) {
        value = { offset, length };
        return [{ tag, vr, value }, offset + length];
    }
    if (equalTag(tag, PixelDataTag)) {
        value = { offset, length: data.byteLength - offset };
        return [{ tag, vr, value }, data.byteLength];
    }
    const [, offsetEnd] = readDataElementRecord(data, offset, options, (tag) => equalTag(tag, SequenceDelimitationItemTag));
    value = { offset, length: offsetEnd - offset };
    return [{ tag, vr, value }, offsetEnd];
}
function isImplicitVR(options, tag) {
    if (equalTag(tag, ItemTag) ||
        equalTag(tag, ItemDelimitationItemTag) ||
        equalTag(tag, SequenceDelimitationItemTag)) {
        // these Tags always use implicit VR (see DICOM part 05 section 7.5)
        return true;
    }
    return options.implicitVR;
}
// -- VR --
// https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html
// prettier-ignore
const VRs = [
    'AE', 'AS', 'AT', 'CS', 'DA', 'DS', 'DT',
    'FD', 'FL', 'IS', 'LO', 'LT', 'OB', 'OD',
    'OF', 'OW', 'PN', 'SH', 'SL', 'SQ', 'SS',
    'ST', 'TM', 'UI', 'UL', 'UN', 'US', 'UT'
];
const dataVR = ["OB", "OW", "OF", "SQ", "UT", "UN"];
/**
 * Read a VR from a DataView
 *
 * @param data - The DataView to read from
 * @param offset - The offset to read at
 * @returns The VR if a valid VR was read, null otherwise.
 */
function getVR(data, offset) {
    const vrString = String.fromCharCode(data.getUint8(offset)) +
        String.fromCharCode(data.getUint8(offset + 1));
    return VRs.find((_vr) => _vr === vrString) || null;
}
const ItemTag = { group: 0xfffe, element: 0xe000 };
const ItemDelimitationItemTag = { group: 0xfffe, element: 0xe00d };
const SequenceDelimitationItemTag = { group: 0xfffe, element: 0xe0dd };
const PixelDataTag = { group: 0x7fe0, element: 0x0010 };
function equalTag(tagA, tagB) {
    return tagA.group === tagB.group && tagA.element === tagB.element;
}
function tagToString(tag) {
    const toPaddedHex = (n) => n.toString(16).padStart(4, "0");
    return `(${toPaddedHex(tag.group)},${toPaddedHex(tag.element)})`;
}
// -- Utils --
/**
 * Trim trailing null characters (\0) from a string.
 *
 * @param str - String to trim the trailing null characters of.
 * @returns Trimmed string.
 */
function stringTrimNull(str) {
    let nullChars = 0;
    while (str.charAt(str.length - 1 - nullChars) === "\0") {
        nullChars++;
    }
    return str.slice(0, -nullChars);
}
