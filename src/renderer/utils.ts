import { TypedArray } from "../decoder/types";

export function toRGBA(
  arr: TypedArray,
  info: {
    columns: number;
    rows: number;
    samplesPerPixel: number;
    photometricInterpretation: string;
    planarConfiguration: number;
    redPaletteColorLookupTableDescriptor: [number, number, number] | null;
    greenPaletteColorLookupTableDescriptor: [number, number, number] | null;
    bluePaletteColorLookupTableDescriptor: [number, number, number] | null;
    redPaletteColorLookupTableData: DataView;
    greenPaletteColorLookupTableData: DataView;
    bluePaletteColorLookupTableData: DataView;
  }
): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(info.columns * info.rows * 4);
  for (let row = 0; row < info.rows; row++) {
    for (let col = 0; col < info.columns; col++) {
      const pixel = row * info.columns + col;

      let r, g, b;

      if (info.samplesPerPixel === 1) {
        const sample = arr[pixel];
        if (info.photometricInterpretation === "MONOCHROME1") {
          r = 255 - sample;
          g = r;
          b = r;
        } else if (info.photometricInterpretation === "MONOCHROME2") {
          r = sample;
          g = r;
          b = r;
        } else if (
          info.photometricInterpretation === "PALETTE COLOR" &&
          info.redPaletteColorLookupTableDescriptor
        ) {
          const numberOfEntries = info.redPaletteColorLookupTableDescriptor[0];
          const firstInputValueMapped =
            info.redPaletteColorLookupTableDescriptor[1];
          const numberOfBits = info.redPaletteColorLookupTableDescriptor[2];
          let i = sample - firstInputValueMapped;
          if (i < 0) i = 0;
          if (i > numberOfEntries) i = numberOfEntries;
          if (numberOfBits === 8) {
            r = info.redPaletteColorLookupTableData.getUint8(i);
            g = info.greenPaletteColorLookupTableData.getUint8(i);
            b = info.bluePaletteColorLookupTableData.getUint8(i);
          } else {
            r = info.redPaletteColorLookupTableData.getUint16(i * 2);
            g = info.greenPaletteColorLookupTableData.getUint16(i * 2);
            b = info.bluePaletteColorLookupTableData.getUint16(i * 2);
          }
        } else {
          //console.warn(
          //  `Unknown Photometric Interpretation ${info.photometricInterpretation} with one sample per pixel.`
          //);
          r = sample;
          g = sample;
          b = sample;
        }
      } else if (info.samplesPerPixel === 3) {
        let sample1, sample2, sample3;
        if (info.planarConfiguration === 0) {
          const i = pixel * 3;
          sample1 = arr[i];
          sample2 = arr[i + 1];
          sample3 = arr[i + 2];
        } else {
          sample1 = arr[pixel];
          sample2 = arr[arr.length * (1 / 3) + pixel];
          sample3 = arr[arr.length * (2 / 3) + pixel];
        }

        if (info.photometricInterpretation === "RGB") {
          r = sample1;
          g = sample2;
          b = sample3;
        } else if (
          info.photometricInterpretation === "YBR_FULL" ||
          info.photometricInterpretation === "YBR_ICT"
        ) {
          const y = sample1;
          let cb = sample2;
          let cr = sample3;
          if (info.photometricInterpretation === "YBR_FULL") {
            cb -= 128;
            cr -= 128;
          }
          r = 0.9117 * y - 0.1565 * cb + 1.402 * cr;
          g = 1.045 * y - 0.2644 * cb - 0.7141 * cr;
          b = 1.0 * y + 1.772 * cb - 0.0001 * cr;
        } else if (info.photometricInterpretation === "YBR_RCT") {
          const y = sample1;
          const cb = sample2;
          const cr = sample3;
          g = y - Math.floor((cr + cb) / 4);
          r = cr + g;
          b = cb + g;
        } else {
          //console.warn(
          //  `Unknown Photometric Interpretation ${info.photometricInterpretation} with three samples per pixel.`
          //);
          r = sample1;
          g = sample2;
          b = sample3;
        }
      } else {
        r = row % 255;
        g = col % 255;
        b = pixel % 255;
        //console.warn(
        //  `Unsupported number of samples per pixel: ${info.samplesPerPixel}.`
        //);
      }

      const i = pixel * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = 255;
    }
  }
  return rgba;
}
