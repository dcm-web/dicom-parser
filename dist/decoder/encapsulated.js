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
const decode = function decode(data, encoding, pixelDescription, frameNumbers) {
    return __awaiter(this, void 0, void 0, function* () {
        const fragments = (0, utils_1.pixelDataToFragments)(data, encoding);
        let [, ...encodedFrames] = fragments;
        if (frameNumbers) {
            encodedFrames = encodedFrames.filter((_, i) => frameNumbers.includes(i));
        }
        const frames = encodedFrames.map(decodeFrame);
        return Promise.resolve({ frames, pixelDescription });
    });
};
const decodeFrame = function (data) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
};
exports.default = decode;
