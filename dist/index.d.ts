export declare function parse(data: DataView): DataElementRecord;
declare type DataLocation = {
    offset: number;
    length: number;
};
declare type DataElement = {
    tag: Tag;
    vr: string | null;
    value: DataLocation;
};
declare type DataElementRecord = Record<string, DataElement>;
declare type Tag = {
    group: number;
    element: number;
};
export {};
