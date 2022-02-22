import * as fs from "fs";
import * as parser from "../src/parser";
import { expect } from "chai";

const dicomFilesDir = "./test/dicom-files";
const dicomDataDir = "./test/dicom-data";

const fileSets = ["pydicom"] as const;
const excludeFiles: Record<typeof fileSets[number], string[]> = {
  pydicom: [
    "OT-PAL-8-face.dcm", // file without header
  ],
};

function fileSetFiles(fileSet: string): string[] {
  const fileSetDir = `${dicomFilesDir}/${fileSet}`;
  const files = fs.readdirSync(fileSetDir);
  return files.filter(
    (file) => !fs.lstatSync(`${fileSetDir}/${file}`).isDirectory()
  );
}

function readDataView(fileSet: string, file: string) {
  const buffer = fs.readFileSync(`${dicomFilesDir}/${fileSet}/${file}`);
  return new DataView(new Uint8Array(buffer).buffer);
}
type FileData = {
  tags: string[];
};
function readFileData(fileSet: string, file: string): FileData {
  return JSON.parse(
    fs.readFileSync(`${dicomDataDir}/${fileSet}/${file}.json`, "utf8")
  ) as FileData;
}

fileSets.forEach((fileSet) => {
  fileSetFiles(fileSet)
    .filter((file) => !excludeFiles[fileSet]?.includes(file))
    .forEach((file) => {
      it(`should parse all DataElements of DICOM file "${fileSet}/${file}"`, () => {
        const expectedTags = readFileData(fileSet, file).tags;
        const dataView = readDataView(fileSet, file);

        const { dataSet } = parser.parse(dataView);
        const tags = Object.keys(dataSet);

        const extraTags = tags.filter((tag) => !expectedTags.includes(tag));
        const missingTags = expectedTags.filter((tag) => !tags.includes(tag));

        expect(extraTags, "extra tags").to.eql([]);
        expect(missingTags, "missing tags").to.eql([]);
      });
    });
});

it("should not parse file without header", () => {
  const dataView = readDataView("pydicom", "OT-PAL-8-face.dcm");
  expect(() => parser.parse(dataView)).to.throw(
    "Invalid DICOM file - prefix not found."
  );
});
