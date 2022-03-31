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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libjpeg_turbo_1 = __importDefault(require("libjpeg-turbo"));
const utils_1 = require("./utils");
let decoder;
const decode = function (data, encoding, pixelDescription, frameNumbers) {
    return __awaiter(this, void 0, void 0, function* () {
        const fragments = (0, utils_1.pixelDataToFragments)(data, encoding);
        let encodedFrames = (0, utils_1.fragmentsToFrames)(fragments);
        if (frameNumbers) {
            encodedFrames = encodedFrames.filter((_, i) => frameNumbers.includes(i));
        }
        const frames = [];
        for (const encodedFrame of encodedFrames) {
            frames.push(yield decodeFrame(encodedFrame));
        }
        return {
            frames,
            pixelDescription: Object.assign(Object.assign({}, pixelDescription), { 
                // JPEGs (mostly) use YBR_FULL_422 internally but when decoded with
                // libjpeg-turbo the conversion to rgb is also performed, so the
                // photometric interpretation needs to be updated.
                photometricInterpretation: pixelDescription.samplesPerPixel === 3
                    ? "RGB"
                    : pixelDescription.photometricInterpretation }),
        };
    });
};
const decodeFrame = function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!decoder) {
            const libJpegTurbo = yield (0, libjpeg_turbo_1.default)();
            decoder = new libJpegTurbo.JPEGDecoder();
        }
        const buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        const encodedBuffer = decoder.getEncodedBuffer(buffer.length);
        encodedBuffer.set(buffer);
        decoder.decode();
        return decoder.getDecodedBuffer();
    });
};
exports.default = decode;
