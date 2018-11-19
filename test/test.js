import DumbDown from "../dumbdown";
var assert = require("assert");


describe("Test DumbDown", function() {
  var fs = require("fs");
  var content = fs.readFileSync("test_examples.json");
  var data = JSON.parse(content);
  data.forEach(example => {
    it(`gets "${example["md"]}" right`, function() {
      let dd = new DumbDown(example["md"]);
      assert.equal(dd.to_html(), example["html"]);
    });
  });
});
