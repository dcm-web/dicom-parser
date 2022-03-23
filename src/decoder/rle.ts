import { interleaveUint8Array } from "./utils";
import { FrameDecoder, PixelDataDecoder } from "./types";
import { pixelDataToFragments } from "./utils";

const decode: PixelDataDecoder = async function (data, encoding) {
  const fragments = pixelDataToFragments(data, encoding);
  const [, ...frames] = fragments;
  return Promise.all(frames.map(decodeFrame));
};

const decodeFrame: FrameDecoder = async function (data) {
  const segmentOffsets = decodeHeader(data);
  const buffer = new Int8Array(data.buffer, data.byteOffset, data.byteLength);
  const segments = segmentOffsets.map((start, i, offsets) => {
    const end = i + 1 < offsets.length ? offsets[i + 1] : buffer.length;
    return decodeSegment(buffer, start, end);
  });

  return Promise.resolve(interleaveUint8Array(segments));
};

/**
 * Decode the RLE Header {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_G.5 | DICOM Part 5 Section G.5}
 * @param data - The DataView to read from.
 */
function decodeHeader(data: DataView): number[] {
  const numberOfSegments = data.getUint32(0, true);
  return [...new Array(numberOfSegments).keys()].map((i) =>
    data.getUint32((i + 1) * 4, true)
  );
}

function decodeSegment(data: Int8Array, start: number, end: number) {
  let dataOut = new Uint8Array(4096); // TODO set actual size
  let offset = start;
  let offsetOut = 0;
  while (offset < end) {
    if (dataOut.length - offsetOut <= 127) {
      const tmp = new Uint8Array(dataOut.length + 4096);
      tmp.set(dataOut, 0);
      dataOut = tmp;
    }
    const n = data[offset];
    offset += 1;
    if (n >= 0) {
      // copy the next n + 1 bytes
      const val = data.subarray(offset, offset + 1 + n + 1);
      offset += n + 1;
      dataOut.set(val, offsetOut);
      offsetOut += n + 1;
    } else if (n >= -127) {
      // copy the next byte -n+1 times
      const val = data[offset];
      offset += 1;
      dataOut.fill(val, offsetOut, offsetOut + -n + 1);
      offsetOut += -n + 1;
    } else {
      continue; // -128
    }
  }
  const trim = Math.max(0, offset - end);
  return dataOut.subarray(0, offsetOut - trim);
}

export default decode;
