"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSequenceItems = exports.readDataSet = void 0;
/**
 * Parse a DataSet from a DataView.
 *
 * @param data - The DataView to read from.
 * @param offsetStart - The offset in the data to start reading at.
 * @param options - Options regarding endianness and VR implicitness.
 * @param stopCondition - Optional callback to stop the parsing (and include or discard the current dataElement and offset) when its tag meets a certain condition.
 * @returns The parsed DataSet and the current offset in the data.
 */
function readDataSet(data, offsetStart, encoding, stopCondition) {
    const elements = {};
    let offset = offsetStart;
    while (offset < data.byteLength) {
        const [element, offsetEnd] = readDataElement(data, offset, encoding);
        const stopOption = stopCondition && stopCondition(element.tag);
        if (stopOption && stopOption === "stop")
            break; // stop before current element
        offset = offsetEnd;
        if (stopOption && stopOption === "stopAndIncludeOffset")
            break; // include the offset but discard the current element
        elements[tagToString(element.tag)] = element;
        if (stopOption && stopOption === "stopAndIncludeElement")
            break; // include the current element
    }
    return [elements, offset];
}
exports.readDataSet = readDataSet;
/**
 * Read a DataElement at offsetStart from a DataView.
 *
 * @param data - The DataView to read from.
 * @param offsetStart - The offset in the data to start reading at.
 * @param options - Options regarding endianness and VR implicitness.
 * @returns The parsed DataElement and the offset of its end in the data.
 */
function readDataElement(data, offsetStart, encoding) {
    let offset = offsetStart;
    // read Tag
    const tag = getTag(data, offset, encoding.littleEndian);
    offset = offset + 4;
    // read VR
    let vr = null;
    if (!encoding.implicitVR && !tagHasImplicitVR(tag)) {
        vr = getVR(data, offset);
        offset += 2;
        if (!vr) {
            console.warn("No Explicit VR found and implicit encoding was not set.");
            offset -= 2;
        }
    }
    // read length
    let length;
    if (!vr) {
        // Implicit VR Format: TAG, 4-byte length, value
        length = data.getUint32(offset, encoding.littleEndian);
        offset += 4;
    }
    else if (dataVR.includes(vr)) {
        // Explicit Data VR Format: TAG, VR, 2-bytes reserved, 4-byte length, value
        offset += 2; // skip reserved bytes
        length = data.getUint32(offset, encoding.littleEndian);
        offset += 4;
    }
    else {
        // Explicit VR Format: TAG, VR, 2-byte length, value
        length = data.getUint16(offset, encoding.littleEndian);
        offset += 2;
    }
    // read value
    let value;
    if (length != 0xffffffff) {
        value = new DataView(data.buffer, data.byteOffset + offset, length);
        return [{ tag, vr, value }, offset + length];
    }
    if (equalTag(tag, ItemTag)) {
        const [, offsetEnd] = readDataSet(data, offset, encoding, (tag) => equalTag(tag, ItemDelimitationItemTag)
            ? "stopAndIncludeOffset"
            : "continue");
        value = new DataView(data.buffer, data.byteOffset + offset, offsetEnd - offset);
        return [{ tag, vr, value }, offsetEnd];
    }
    if (equalTag(tag, PixelDataTag)) {
        // check if the last 8 bytes encode a Sequence Delimitation Tag
        // instead of searching for it, since Pixel Data should be the last Data Element
        const offsetEnd = data.byteLength - 8;
        const tagEnd = getTag(data, offsetEnd, encoding.littleEndian);
        if (equalTag(tagEnd, SequenceDelimitationItemTag)) {
            value = new DataView(data.buffer, data.byteOffset + offset, offsetEnd - offset);
            return [{ tag, vr, value }, data.byteLength];
        }
    }
    if (vr === "SQ") {
        const [, offsetEnd] = readSequenceItems(data, offset, encoding);
        value = new DataView(data.buffer, data.byteOffset + offset, offsetEnd - offset);
        return [{ tag, vr, value }, offsetEnd];
    }
    // TODO: Implement an efficient search algorithm.
    const lengthOfDelimiter = 8; // includes the Delimination Tag and its 4 byte long "length value" of zero
    let offsetEnd = offset;
    while (offsetEnd <= data.byteLength - lengthOfDelimiter) {
        const tagEnd = getTag(data, offsetEnd, encoding.littleEndian);
        if (equalTag(tagEnd, SequenceDelimitationItemTag)) {
            value = new DataView(data.buffer, data.byteOffset + offset, offsetEnd - offset);
            return [{ tag, vr, value }, offsetEnd + lengthOfDelimiter];
        }
        offsetEnd += 1;
    }
    throw Error("Reached end of file searching for a Sequence Delimitation Tag");
}
function readSequenceItems(data, offsetStart, encoding) {
    const elements = [];
    let offset = offsetStart;
    while (offset < data.byteLength) {
        const [element, offsetEnd] = readDataElement(data, offset, encoding);
        offset = offsetEnd;
        if (equalTag(element.tag, SequenceDelimitationItemTag))
            break;
        if (!equalTag(element.tag, ItemTag)) {
            console.warn(`Expected ItemTag but found tag "${tagToString(element.tag)}".`);
        }
        elements.push(element);
    }
    return [elements, offset];
}
exports.readSequenceItems = readSequenceItems;
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
 * Read a Tag from a DataView.
 *
 * @param data - The DataView to read from.
 * @param offset - The offset to read at.
 * @param littleEndian - True if byte order is little endian.
 * @returns The Tag at offset.
 */
function getTag(data, offset, littleEndian) {
    return {
        group: data.getUint16(offset, littleEndian),
        element: data.getUint16(offset + 2, littleEndian),
    };
}
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
function tagHasImplicitVR(tag) {
    // these Tags always use implicit VR (see DICOM part 05 section 7.5)
    return (equalTag(tag, ItemTag) ||
        equalTag(tag, ItemDelimitationItemTag) ||
        equalTag(tag, SequenceDelimitationItemTag));
}
