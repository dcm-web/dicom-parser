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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.utils = void 0;
const core_1 = require("./core");
const transferSyntax_1 = require("./transferSyntax");
const utils = __importStar(require("./utils"));
exports.utils = __importStar(require("./utils"));
function parse(data) {
    let offset = 128; // skip 128 bytes of file preamble
    const prefix = data.getUint32(offset);
    offset += 4;
    // verify the DICOM prefix bytes to be 44 49 43 4D ("DICM")
    if (prefix !== 0x4449434d) {
        throw Error("Invalid DICOM file - prefix not found.");
    }
    // read Metadata
    const [meta, metaOffsetEnd] = (0, core_1.readDataSet)(data, offset, { implicitVR: false, littleEndian: true }, (tag) => (tag.group !== 2 ? "stop" : "continue"));
    offset = metaOffsetEnd;
    // read transfer syntax
    let transferSyntaxUid;
    const transferSyntaxDataElement = meta["(0002,0010)"];
    if (transferSyntaxDataElement) {
        transferSyntaxUid = utils.stringTrimNull(utils.decodeString(transferSyntaxDataElement.value));
    }
    else {
        /** Default as defined in {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_10.1 | DICOM Part 5 Section 10.1}. */
        transferSyntaxUid = "1.2.840.10008.1.2";
    }
    const transferSyntax = (0, transferSyntax_1.transferSyntaxFromUid)(transferSyntaxUid);
    // read content
    const [content] = (0, core_1.readDataSet)(data, offset, {
        littleEndian: transferSyntax.byteOrdering === "Little Endian",
        implicitVR: transferSyntax.implicitVR,
    });
    return {
        dataSet: Object.assign(Object.assign({}, meta), content),
        transferSyntax,
    };
}
exports.parse = parse;
