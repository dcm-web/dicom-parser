import { DataSet } from "./core";
export { DataSet } from "./core";
import { TransferSyntax } from "./transferSyntax";
export * as utils from "./utils";
export declare function parse(data: DataView): {
    dataSet: DataSet;
    transferSyntax: TransferSyntax;
};
