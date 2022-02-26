declare module "jpeg-lossless-decoder-js" {
  export namespace lossless {
    export class Decoder {
      constructor(buffer?: ArrayBuffer, numBytes?: number);
      decode(
        buffer: ArrayBuffer | undefined,
        offset: number,
        length: number,
        numBytes?: number
      ): Uint8Array | Uint16Array;
    }
  }
}
