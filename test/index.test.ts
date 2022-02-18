import { readFileSync } from "fs";
import { parse } from "../src/index";
import { expect } from "chai";

it("parses a DICOM file", () => {
  const data = readFileSync(
    "./test/dicom-files/pydicom-data/data/693_J2KR.dcm"
  );
  const dataView = new DataView(new Uint8Array(data).buffer);
  expect(parse.bind(null, dataView)).to.not.throw();
});

it("parses a DICOM file", () => {
  const data = readFileSync(
    "./test/dicom-files/pydicom-data/data/bad_sequence.dcm"
  );
  const dataView = new DataView(new Uint8Array(data).buffer);
  expect(parse.bind(null, dataView)).to.not.throw();
});

it("parses a DICOM file", () => {
  const data = readFileSync(
    "./test/dicom-files/pydicom-data/data/emri_small_big_endian.dcm"
  );
  const dataView = new DataView(new Uint8Array(data).buffer);
  expect(parse.bind(null, dataView)).to.not.throw();
});
