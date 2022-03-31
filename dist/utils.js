"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapBytes = void 0;
function swapBytes(data, bytes) {
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        const byte = i % bytes;
        out[i] = data[i + bytes - byte - byte - 1];
    }
    return out;
}
exports.swapBytes = swapBytes;
