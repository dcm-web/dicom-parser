"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getImagePixelTransformation = exports.getImagePixelDescription = exports.getFrames = exports.renderer = exports.decoder = exports.parser = void 0;
const parser = __importStar(require("./parser"));
exports.parser = __importStar(require("./parser"));
const decoder = __importStar(require("./decoder"));
exports.decoder = __importStar(require("./decoder"));
exports.renderer = __importStar(require("./renderer"));
function getFrames(dataSet, transferSyntax, frameNumbers) {
    return __awaiter(this, void 0, void 0, function* () {
        const pixelDataElement = dataSet["(7fe0,0010)"];
        const decodeFn = decoder.pixelDecoderForTransferSyntax(transferSyntax.uid);
        if (decodeFn == null) {
            throw Error("No decoder for image.");
        }
        const pixelDescription = getImagePixelDescription(dataSet, transferSyntax.byteOrdering);
        return decodeFn(pixelDataElement.value, {
            littleEndian: transferSyntax.byteOrdering === "Little Endian",
            implicitVR: transferSyntax.implicitVR,
        }, pixelDescription, frameNumbers);
    });
}
exports.getFrames = getFrames;
function getImagePixelDescription(dataSet, byteOrdering) {
    var _a, _b, _c;
    // read unsinged short (US)
    function readUS(tag) {
        if (!dataSet[tag])
            return;
        return dataSet[tag].value.getUint16(0, byteOrdering === "Little Endian");
    }
    function readPaletteColorLookupTableDescriptor(tag) {
        if (!dataSet[tag])
            return;
        const data = dataSet[tag].value;
        const littleEndian = byteOrdering === "Little Endian";
        return [
            data.getUint16(0, littleEndian),
            data.getUint16(2, littleEndian),
            data.getUint16(4, littleEndian),
        ];
    }
    return {
        samplesPerPixel: readUS("(0028,0002)") || 1,
        photometricInterpretation: parser.utils
            .decodeString(dataSet["(0028,0004)"].value)
            .trim(),
        rows: readUS("(0028,0010)") || 1,
        columns: readUS("(0028,0011)") || 1,
        bitsAllocated: readUS("(0028,0100)") || 8,
        bitsStored: readUS("(0028,0101)") || 8,
        pixelRepresentation: readUS("(0028,0103)") || 0,
        planarConfiguration: readUS("(0028,0006)"),
        smallestValue: readUS("(0028,0106)"),
        largestValue: readUS("(0028,0107)"),
        redPaletteColorLookupTableDescriptor: readPaletteColorLookupTableDescriptor("(0028,1101)"),
        greenPaletteColorLookupTableDescriptor: readPaletteColorLookupTableDescriptor("(0028,1102)"),
        bluePaletteColorLookupTableDescriptor: readPaletteColorLookupTableDescriptor("(0028,1103)"),
        redPaletteColorLookupTableData: (_a = dataSet["(0028,1201)"]) === null || _a === void 0 ? void 0 : _a.value,
        greenPaletteColorLookupTableData: (_b = dataSet["(0028,1202)"]) === null || _b === void 0 ? void 0 : _b.value,
        bluePaletteColorLookupTableData: (_c = dataSet["(0028,1203)"]) === null || _c === void 0 ? void 0 : _c.value,
    };
}
exports.getImagePixelDescription = getImagePixelDescription;
function getImagePixelTransformation(dataSet) {
    // read decimal string (DS)
    function readDS(tag) {
        if (!dataSet[tag])
            return;
        return parseFloat(parser.utils.decodeString(dataSet[tag].value));
    }
    return {
        windowCenter: readDS("(0028,1050)"),
        windowWidth: readDS("(0028,1051)"),
        rescaleIntercept: readDS("(0028,1052)"),
        rescaleSlope: readDS("(0028,1053)"),
    };
}
exports.getImagePixelTransformation = getImagePixelTransformation;
