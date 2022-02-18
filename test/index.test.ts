import { parse } from "../src/index";
import { expect } from "chai";

it("parses a single Integer value", () => {
  const buffer = new ArrayBuffer(1);
  const view = new DataView(buffer);
  view.setInt8(0, 3);

  expect(parse(view)).to.equal(3);
});
