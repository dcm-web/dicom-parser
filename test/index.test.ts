import { readFileSync } from "fs";
import * as parser from "../src/parser";
import { expect } from "chai";

it("parses all DataElements of a DICOM file", () => {
  const data = readFileSync(
    "./test/dicom-files/pydicom-data/data/693_J2KR.dcm"
  );
  const dataView = new DataView(new Uint8Array(data).buffer);
  const dataSet = parser.parse(dataView);
  expect(Object.keys(dataSet).length).to.equal(86);
});

it("parses all DataElements of a DICOM file", () => {
  const data = readFileSync(
    "./test/dicom-files/pydicom-data/data/bad_sequence.dcm"
  );
  const dataView = new DataView(new Uint8Array(data).buffer);
  const dataSet = parser.parse(dataView);
  expect(Object.keys(dataSet).length).to.equal(87);
});

it("parses all DataElements of a DICOM file", () => {
  const data = readFileSync(
    "./test/dicom-files/pydicom-data/data/emri_small_big_endian.dcm"
  );
  const dataView = new DataView(new Uint8Array(data).buffer);
  const dataSet = parser.parse(dataView);
  expect(Object.keys(dataSet).length).to.equal(139);
});
