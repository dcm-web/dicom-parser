import { DataEncoding } from "./types";
import { readSequenceItems } from "../parser/core";
const eoiMarker = 0xffd9;

export function pixelDataToFragments(data: DataView, encoding: DataEncoding) {
  const [sequenceItems] = readSequenceItems(data, 0, encoding);
  return sequenceItems.map((item) => item.value);
}

export function fragmentsToFrames(
  data: DataView[],
  expected?: number
): DataView[] {
  const [, ...fragments] = data; // TODO use the basic offset table when available
  if (expected === 1) return [concatDataViews(fragments)];
  if (expected === fragments.length) return fragments;
  const fragmentsByFrame: Array<DataView[]> = [];
  let currentFrameFragments: DataView[] = [];
  for (const fragment of fragments) {
    currentFrameFragments.push(fragment);

    if (fragment.byteLength < 1) continue;
    // the fragment might be padded with one 0x00 byte
    const padding = fragment.getUint8(fragment.byteLength - 1) === 0 ? 1 : 0;
    if (fragment.byteLength < padding + 2) continue;
    if (
      fragment.getUint16(fragment.byteLength - padding - 2) === eoiMarker ||
      fragment.getUint16(fragment.byteLength - padding - 2, true) === eoiMarker // TODO get correct endianness instead of trying both
    ) {
      fragmentsByFrame.push(currentFrameFragments);
      currentFrameFragments = [];
    }
  }
  return fragmentsByFrame.map(concatDataViews);
}

export function concatDataViews(dataViews: DataView[]): DataView {
  const outLength = dataViews.reduce(
    (length, dataView) => length + dataView.byteLength,
    0
  );
  const out = new Uint8Array(outLength);
  let offset = 0;
  for (let i = 0; i < dataViews.length; i += 1) {
    const current = new Uint8Array(
      dataViews[i].buffer,
      dataViews[i].byteOffset,
      dataViews[i].byteLength
    );
    out.set(current, offset);
    offset += current.length;
  }
  return new DataView(out.buffer);
}

export function concatUint8Array(arrays: Uint8Array[]): Uint8Array {
  const outLength = arrays.reduce((total, array) => total + array.length, 0);
  const out = new Uint8Array(outLength);
  let offset = 0;
  for (let i = 0; i < arrays.length; i += 1) {
    out.set(arrays[i], offset);
    offset += arrays[i].length;
  }
  return out;
}

export function interleaveUint8Array(arrays: Uint8Array[]): Uint8Array {
  const outLength = arrays.reduce((total, array) => total + array.length, 0);
  const out = new Uint8Array(outLength);
  console.log(arrays[0]?.length, arrays[1]?.length);
  for (let i = 0; i < outLength; i += 1) {
    const arr = arrays[i % arrays.length];
    const j = ~~(i / arrays.length);
    out[i] = arr[j];
  }
  return out;
}
