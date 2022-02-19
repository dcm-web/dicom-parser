import * as fs from "fs";
import * as parser from "../src/parser";
import { expect } from "chai";

const files = fs.readdirSync("./test/dicom-files/pydicom/"); // ["693_J2KR.dcm", "bad_sequence.dcm", "emri_small_big_endian.dcm"];

files.forEach((file) => {
  if (fs.lstatSync("./test/dicom-files/pydicom/" + file).isDirectory()) return;

  it(`parses all DataElements of DICOM file "${file}"`, () => {
    const expectedTags = JSON.parse(
      fs.readFileSync(`./test/dicom-tags/pydicom/${file}.json`, "utf8")
    ) as string[];

    const data = fs.readFileSync(`./test/dicom-files/pydicom/${file}`);
    const dataView = new DataView(new Uint8Array(data).buffer);
    const dataSet = parser.parse(dataView);
    const tags = Object.keys(dataSet);

    const extraTags = tags.filter((tag) => !expectedTags.includes(tag));
    const missingTags = expectedTags.filter((tag) => !tags.includes(tag));

    expect(extraTags, "extra tags").to.eql([]);
    expect(missingTags, "missing tags").to.eql([]);
  });
});
