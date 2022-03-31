"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const utils_2 = require("./utils");
const utils_3 = require("../utils");
const decode = function (data, encoding, pixelDescription, frameNumbers) {
    return __awaiter(this, void 0, void 0, function* () {
        const fragments = (0, utils_2.pixelDataToFragments)(data, encoding);
        let [, ...encodedFrames] = fragments;
        if (frameNumbers) {
            encodedFrames = encodedFrames.filter((_, i) => frameNumbers.includes(i));
        }
        let frames = encodedFrames.map((encodedFrame) => decodeFrame(encodedFrame));
        // swap bytes to match expected endianness
        const bytesAllocated = Math.ceil(pixelDescription.bitsAllocated / 8);
        if (encoding.littleEndian && bytesAllocated > 1) {
            frames = frames.map((frame) => (0, utils_3.swapBytes)(frame, bytesAllocated));
        }
        return Promise.resolve({ frames, pixelDescription });
    });
};
const decodeFrame = function (data) {
    const segmentOffsets = decodeHeader(data);
    const buffer = new Int8Array(data.buffer, data.byteOffset, data.byteLength);
    const segments = segmentOffsets.map((start, i, offsets) => {
        const end = i + 1 < offsets.length ? offsets[i + 1] : buffer.length;
        return decodeSegment(buffer, start, end);
    });
    return (0, utils_1.interleaveUint8Array)(segments);
};
/**
 * Decode the RLE Header {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_G.5 | DICOM Part 5 Section G.5}
 * @param data - The DataView to read from.
 */
function decodeHeader(data) {
    const numberOfSegments = data.getUint32(0, true);
    return [...new Array(numberOfSegments).keys()].map((i) => data.getUint32((i + 1) * 4, true));
}
function decodeSegment(data, start, end) {
    let dataOut = new Uint8Array(4096); // TODO set actual size
    let offset = start;
    let offsetOut = 0;
    while (offset < end) {
        if (dataOut.length - offsetOut <= 127) {
            const tmp = new Uint8Array(dataOut.length + 4096);
            tmp.set(dataOut, 0);
            dataOut = tmp;
        }
        const n = data[offset];
        offset += 1;
        if (n >= 0) {
            // copy the next n + 1 bytes
            const val = data.subarray(offset, offset + 1 + n + 1);
            offset += n + 1;
            dataOut.set(val, offsetOut);
            offsetOut += n + 1;
        }
        else if (n >= -127) {
            // copy the next byte -n+1 times
            const val = data[offset];
            offset += 1;
            dataOut.fill(val, offsetOut, offsetOut + -n + 1);
            offsetOut += -n + 1;
        }
        else {
            continue; // -128
        }
    }
    const trim = Math.max(0, offset - end);
    return dataOut.subarray(0, offsetOut - trim);
}
exports.default = decode;
