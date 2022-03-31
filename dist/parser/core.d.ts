/**
 * Parse a DataSet from a DataView.
 *
 * @param data - The DataView to read from.
 * @param offsetStart - The offset in the data to start reading at.
 * @param options - Options regarding endianness and VR implicitness.
 * @param stopCondition - Optional callback to stop the parsing (and include or discard the current dataElement and offset) when its tag meets a certain condition.
 * @returns The parsed DataSet and the current offset in the data.
 */
export declare function readDataSet(data: DataView, offsetStart: number, encoding: DataEncoding, stopCondition?: ParseStopCondition): [DataSet, number];
export declare function readSequenceItems(data: DataView, offsetStart: number, encoding: DataEncoding): [DataElement[], number];
declare type Tag = {
    group: number;
    element: number;
};
export declare type DataSet = Record<string, DataElement>;
export declare type DataElement = {
    tag: Tag;
    vr: string | null;
    value: DataView;
};
export declare type DataEncoding = {
    implicitVR: boolean;
    littleEndian: boolean;
};
declare type ParseStopOption = "continue" | "stop" | "stopAndIncludeOffset" | "stopAndIncludeElement";
declare type ParseStopCondition = (tag: Tag) => ParseStopOption;
export {};
