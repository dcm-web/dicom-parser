import * as parser from "./parser";
export * as parser from "./parser";
export * as decoder from "./decoder";
export * as renderer from "./renderer";
import { ByteOrdering, ImagePixelDescription, ImagePixelTransformation } from "./types";
import { TransferSyntax } from "./parser/transferSyntax";
export declare function getFrames(dataSet: parser.DataSet, transferSyntax: TransferSyntax, frameNumbers?: number[]): Promise<{
    frames: Uint8Array[];
    pixelDescription: ImagePixelDescription;
}>;
export declare function getImagePixelDescription(dataSet: parser.DataSet, byteOrdering: ByteOrdering): ImagePixelDescription;
export declare function getImagePixelTransformation(dataSet: parser.DataSet): ImagePixelTransformation;
