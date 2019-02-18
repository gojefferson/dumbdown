import toHtml from "..";
// let assert = require("assert");
import assert from "assert";
import fs from "fs";


describe("Test DumbDown", function() {
  let content = fs.readFileSync("test_examples.json");
  let data = JSON.parse(content);
  data.forEach(example => {
    it(`gets "${example["md"]}" right`, function() {
      let html = toHtml(example["md"]);
      assert.equal(html, example["html"]);
    });
  });
});
