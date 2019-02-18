/**
 * Initially created with help of Python to ES6 converter:
 * - https://github.com/metapensiero/metapensiero.pj#usage
 *
 * Then ... cleaned up A LOT to get it to run properly.
 */

const _LOOKBEHINDS = "((?<=^)|(?<=\\s)|(?<=[!.,;:?]))";
const _LOOKAHEADS = "(?=\\s|$|[!.,;:?])";

const _STRONG = "\\*(" + "[^*]*" + ")\\*";

const _ITAL = "_(" + "[^_]*" + ")_";

const STRONG_RE = _LOOKBEHINDS + _STRONG + _LOOKAHEADS;
const ITAL_RE = _LOOKBEHINDS + _ITAL + _LOOKAHEADS;

class ReAdapter {
  constructor(regex, string) {
    this._regex = new RegExp(regex);
    this._m = this._regex.exec(string);
  }

  get start_index() {
    if (!this._m) {
      return null;
    } else {
      return this._m.index;
    }
  }

  get end_index() {
    if (!this._m) {
      return null;
    } else {
      return this._m.index + this._m[0].length;
    }
  }

  get content() {
    if (!this._m) {
      return null;
    } else {
      return this._m[2];
    }
  }
}

function extract_first_node(input_string) {
  let _max, ital, split_point, strong;
  strong = new ReAdapter(STRONG_RE, input_string);
  ital = new ReAdapter(ITAL_RE, input_string);

  if (strong.start_index === 0) {
    return [
      new StrongNode(strong.content),
      input_string.slice(strong.end_index)
    ];
  }

  if (ital.start_index === 0) {
    return [new ItalNode(ital.content), input_string.slice(ital.end_index)];
  }

  if (!strong.start_index && !ital.start_index) {
    return [new TextNode(input_string), ""];
  }

  _max = input_string.length;
  split_point = Math.min(strong.start_index || _max, ital.start_index || _max);
  return [
    new TextNode(input_string.slice(0, split_point)),
    input_string.slice(split_point)
  ];
}

class Node {
  constructor(content = "") {
    let node;
    this.children = [];
    this.is_leaf_node = false;
    if (!this.is_leaf_node) {
      while (content !== "") {
        [node, content] = extract_first_node(content);
        this.append_child(node);
      }
    }
  }

  append_child(node) {
    this.children.push(node);
  }

  get_html() {
    return this.children.reduce((html, child) => {
      return html + child.get_html();
    }, "");
  }
}

class TextNode {
  constructor(content = "") {
    this.content = content;
  }

  get_html() {
    return this.content;
  }
}

class ParentNode extends Node {
  constructor() {
    super(...arguments);
    this.parent_tag = "UNDEFINED";
  }

  get_html() {
    let child_contents = this.children.reduce((accum, child) => {
      return accum + child.get_html();
    }, "");
    return `<${this.parent_tag}>${child_contents.trim()}</${this.parent_tag}>`;
  }
}

class ItalNode extends ParentNode {
  constructor() {
    super(...arguments);
    this.parent_tag = "i";
  }
}

class StrongNode extends ParentNode {
  constructor() {
    super(...arguments);
    this.parent_tag = "strong";
  }
}

class ParagraphNode extends ParentNode {
  constructor() {
    super(...arguments);
    this.parent_tag = "p";
  }
}

class Tree {
  constructor() {
    this.root = new Node();
  }

  get_html() {
    return this.root.get_html();
  }
}

class DumbDown {
  constructor(md = "") {
    this._md = md.trim();
    this._tree = new Tree();
    this._lines = this._md.split("\n");
    this._build_tree();
  }

  _build_tree() {
    let p;
    this._lines.forEach(line => {
      p = new ParagraphNode(line);
      this._tree.root.append_child(p);
    });
  }

  to_html() {
    return this._tree.get_html();
  }
}

export default function toHtml(md = "") {
  return new DumbDown(md).to_html();
}
