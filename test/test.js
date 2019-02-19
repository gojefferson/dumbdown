import { toHtml, toPlain } from "..";
import assert from "assert";
import fs from "fs";

describe("Test DumbDown", function() {
  let content = fs.readFileSync("test/test_examples.json");
  let data = JSON.parse(content);
  data.forEach(example => {
    it(`gets "${example["md"]}" right`, function() {
      assert.equal(toHtml(example["md"]), example["html"]);
      assert.equal(toPlain(example["md"]), example["plain"]);
    });
  });
});
