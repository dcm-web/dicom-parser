"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const utils_1 = require("./utils");
const utils_2 = require("../utils");
function render(frame, byteOrdering, pixelDescription, pixelTransformation) {
    console.log(pixelDescription);
    console.log(pixelTransformation);
    console.log("frame", frame);
    const typedPixelData = pixelToTypedArray(frame, byteOrdering, pixelDescription);
    console.log("typed", typedPixelData);
    const typedPixelDataWithModLut = applyModalityLut(typedPixelData, pixelTransformation);
    console.log("modality LUT", typedPixelDataWithModLut);
    const window = getWindow(pixelTransformation, pixelDescription);
    console.log("window", window);
    const arr = applyWindow(typedPixelDataWithModLut, window);
    console.log("window applied", arr);
    const rgba = (0, utils_1.toRGBA)(arr, pixelDescription);
    return new ImageData(rgba, pixelDescription.columns, pixelDescription.rows);
}
exports.render = render;
var PixelRepresentation;
(function (PixelRepresentation) {
    PixelRepresentation[PixelRepresentation["Unsigned"] = 0] = "Unsigned";
    PixelRepresentation[PixelRepresentation["Signed"] = 1] = "Signed";
})(PixelRepresentation || (PixelRepresentation = {}));
function pixelToTypedArray(data, byteOrdering, info) {
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
        data = new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    }
    const nativeByteOrdering = getNativeByteOrdering();
    if (byteOrdering !== nativeByteOrdering) {
        data = (0, utils_2.swapBytes)(data, bytesAllocated);
    }
    if (info.bitsAllocated === 8) {
        if (info.pixelRepresentation === PixelRepresentation.Signed) {
            return new Int8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        else {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
    }
    if (info.bitsAllocated === 16) {
        if (info.pixelRepresentation === PixelRepresentation.Signed) {
            return new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
        }
        else {
            return new Uint16Array(data.buffer, data.byteOffset, data.byteLength / 2);
        }
    }
    if (info.bitsAllocated === 32) {
        if (info.pixelRepresentation === PixelRepresentation.Signed) {
            return new Int32Array(data.buffer, data.byteOffset, data.byteLength / 4);
        }
        else {
            return new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
        }
    }
    throw Error(`Unsupported pixel data type with ${info.bitsAllocated} allocated bits.`);
}
// https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.html#sect_C.11.1
function applyModalityLut(data, info) {
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
function getWindow({ windowWidth, windowCenter, }, info) {
    if (windowWidth !== undefined && windowCenter !== undefined) {
        return { width: windowWidth, center: windowCenter };
    }
    if (info.smallestValue !== undefined && info.largestValue !== undefined) {
        const width = info.largestValue - info.smallestValue;
        return { width, center: width / 2 };
    }
    const width = Math.pow(2, info.bitsStored);
    return { width, center: width / 2 };
}
function applyWindow(data, window) {
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
        }
        else if (x > c + w / 2) {
            y = ymax;
        }
        else {
            y = ((x - c) / w + 0.5) * (ymax - ymin) + ymin;
        }
        out[i] = y;
    }
    return out;
}
function getNativeByteOrdering() {
    const arrayBuffer = new ArrayBuffer(2);
    const uint8Array = new Uint8Array(arrayBuffer);
    const uint16array = new Uint16Array(arrayBuffer);
    uint8Array[0] = 0xaa;
    uint8Array[1] = 0xbb;
    if (uint16array[0] === 0xbbaa)
        return "Little Endian";
    return "Big Endian";
}
