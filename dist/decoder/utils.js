"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interleaveUint8Array = exports.concatUint8Array = exports.concatDataViews = exports.fragmentsToFrames = exports.pixelDataToFragments = void 0;
const core_1 = require("../parser/core");
const eoiMarker = 0xffd9;
function pixelDataToFragments(data, encoding) {
    const [sequenceItems] = (0, core_1.readSequenceItems)(data, 0, encoding);
    return sequenceItems.map((item) => item.value);
}
exports.pixelDataToFragments = pixelDataToFragments;
function fragmentsToFrames(data, expected) {
    const [, ...fragments] = data; // TODO use the basic offset table when available
    if (expected === 1)
        return [concatDataViews(fragments)];
    if (expected === fragments.length)
        return fragments;
    const fragmentsByFrame = [];
    let currentFrameFragments = [];
    for (const fragment of fragments) {
        currentFrameFragments.push(fragment);
        if (fragment.byteLength < 1)
            continue;
        // the fragment might be padded with one 0x00 byte
        const padding = fragment.getUint8(fragment.byteLength - 1) === 0 ? 1 : 0;
        if (fragment.byteLength < padding + 2)
            continue;
        if (fragment.getUint16(fragment.byteLength - padding - 2) === eoiMarker ||
            fragment.getUint16(fragment.byteLength - padding - 2, true) === eoiMarker // TODO get correct endianness instead of trying both
        ) {
            fragmentsByFrame.push(currentFrameFragments);
            currentFrameFragments = [];
        }
    }
    return fragmentsByFrame.map(concatDataViews);
}
exports.fragmentsToFrames = fragmentsToFrames;
function concatDataViews(dataViews) {
    const outLength = dataViews.reduce((length, dataView) => length + dataView.byteLength, 0);
    const out = new Uint8Array(outLength);
    let offset = 0;
    for (let i = 0; i < dataViews.length; i += 1) {
        const current = new Uint8Array(dataViews[i].buffer, dataViews[i].byteOffset, dataViews[i].byteLength);
        out.set(current, offset);
        offset += current.length;
    }
    return new DataView(out.buffer);
}
exports.concatDataViews = concatDataViews;
function concatUint8Array(arrays) {
    const outLength = arrays.reduce((total, array) => total + array.length, 0);
    const out = new Uint8Array(outLength);
    let offset = 0;
    for (let i = 0; i < arrays.length; i += 1) {
        out.set(arrays[i], offset);
        offset += arrays[i].length;
    }
    return out;
}
exports.concatUint8Array = concatUint8Array;
function interleaveUint8Array(arrays) {
    var _a, _b;
    const outLength = arrays.reduce((total, array) => total + array.length, 0);
    const out = new Uint8Array(outLength);
    console.log((_a = arrays[0]) === null || _a === void 0 ? void 0 : _a.length, (_b = arrays[1]) === null || _b === void 0 ? void 0 : _b.length);
    for (let i = 0; i < outLength; i += 1) {
        const arr = arrays[i % arrays.length];
        const j = ~~(i / arrays.length);
        out[i] = arr[j];
    }
    return out;
}
exports.interleaveUint8Array = interleaveUint8Array;
