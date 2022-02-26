declare module "openjpeg" {
  type FrameInfo = {
    width: number;
    height: number;
    bitsPerSample: number;
    componentCount: number;
    isSigned: boolean;
  };
  type Size = {
    width: number;
    height: number;
  };
  type Point = {
    x: number;
    y: number;
  };

  class J2KDecoder {
    constructor();
    getEncodedBuffer(encodedSize: number): Uint8Array;
    getDecodedBuffer(): Uint8Array;
    readHeader(): void;
    calculateSizeAtDecompositionLevel(decompositionLevel: number): Size;
    decode(): void;
    decodeSubResolution(decompositionLevel: number, decodeLayer: number): void;
    getFrameInfo(): FrameInfo;
    getNumDecompositions(): number;
    getIsReversible(): boolean;
    getProgressionOrder(): number;
    getImageOffset(): Point;
    getTileSize(): Size;
    getTileOffset(): Point;
    getBlockDimensions(): Size;
    getNumLayers(): number;
    getColorSpace(): number;
    delete(): void;
  }

  class J2KEncoder {
    constructor();
    getDecodedBuffer(frameInfo: FrameInfo): Uint8Array;
    getEncodedBuffer(): Uint8Array;
    encode(): void;
    setDecompositions(decompositions: number): void;
    setQuality(lossless: boolean, numEncodeLayers: number): void;
    setCompressionRatio(layer: number, compressionRatio: number): void;
    setProgressionOrder(progressionOrder: number): void;
    setDownSample(component: number, downSample: Point): void;
    setImageOffset(imageOffset: Point): void;
    setTileSize(tileSize: Size): void;
    setTileOffset(tileOffset: Point): void;
    setBlockDimensions(blockDimensions: Size): void;
    setNumPrecincts(numLevels: number): void;
    setPrecinct(level: number, precinct: Size): void;
    delete(): void;
  }

  type OpenJPEG = {
    getVersion(): string;
    J2KDecoder: typeof J2KDecoder;
    J2KEncoder: typeof J2KEncoder;
  };

  function factory(): Promise<OpenJPEG>;

  export = factory;
}
