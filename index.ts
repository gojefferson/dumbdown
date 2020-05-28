/**
 * Initially created with help of Python to ES6 converter:
 * - https://github.com/metapensiero/metapensiero.pj#usage
 *
 * Then ... cleaned up A LOT to get it to run properly.
 */

const _FAKE_LOOKBEHINDS = "((^)|(\\s)|([!.,;:?]))";
const _LOOKAHEADS = "(?=\\s|$|[!.,;:?])";

const _STRONG = "\\*([^*]*)\\*";

const _ITAL = "_(" + "[^_]*" + ")_";

const STRONG_RE = _FAKE_LOOKBEHINDS + _STRONG + _LOOKAHEADS;
const ITAL_RE = _FAKE_LOOKBEHINDS + _ITAL + _LOOKAHEADS;

const BLOCK_QUOTE_RE = "(^\\s*>|^\\s*&gt;)(.*)$";

class ReAdapter {
  constructor(regex, string) {
    this._regex = new RegExp(regex);
    this._m = this._regex.exec(string);
  }

  get start_index() {
    if (!this._m) {
      return null;
    } else {
      // _m[3] corresponds to (\s) in _FAKE_LOOKBEHINDS
      // and _m[4] corresponds to ([!.,;:?]))
      // if either matched, then we have an extra character in the full
      // match (_m[0]) that we need to exclude.
      if (this._m[3] || this._m[4]) {
        return this._m.index + 1;
      }
      return this._m.index;
    }
  }

  get end_index() {
    if (!this._m) {
      return null;
    } else {
      return this.start_index + this._m[0].length;
    }
  }

  get content() {
    if (!this._m) {
      return null;
    } else {
      return this._m[5];
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
        this.appendChild(node);
      }
    }
  }

  appendChild(node) {
    this.children.push(node);
  }

  getPlain() {
    return this.children.reduce((html, child) => {
      return html + child.getPlain();
    }, "");
  }

  getHtml() {
    return this.children.reduce((html, child) => {
      return html + child.getHtml();
    }, "");
  }
}

class TextNode {
  constructor(content = "") {
    this.content = content;
  }

  getPlain() {
    return this.content;
  }

  getHtml() {
    return this.content;
  }
}

class ParentNode extends Node {
  constructor() {
    super(...arguments);
    this.parentTag = null;
    this.blockElement = false;
  }

  getPlain() {
    let childContents = this.children.reduce((accum, child) => {
      return accum + child.getPlain();
    }, "");
    if (this.blockElement) {
      return `${childContents.trim()} `;
    }
    return childContents.trim();
  }

  getHtml() {
    let childContents = this.children.reduce((accum, child) => {
      return accum + child.getHtml();
    }, "");
    if (this.parentTag) {
      return `<${this.parentTag}>${childContents.trim()}</${this.parentTag}>`;
    } else {
      return childContents.trim();
    }
  }
}

class ItalNode extends ParentNode {
  constructor() {
    super(...arguments);
    this.parentTag = "i";
  }
}

class StrongNode extends ParentNode {
  constructor() {
    super(...arguments);
    this.parentTag = "strong";
  }
}

class ParagraphNode extends ParentNode {
  constructor() {
    super(...arguments);
    this.blockElement = true;
    this.parentTag = "p";
  }
}

class BlockQuoteNode extends ParentNode {
  constructor() {
    super(...arguments);
    this.blockElement = true;
    this.parentTag = "blockquote";
  }
}

class Tree {
  constructor() {
    this.root = new Node();
  }

  getHtml() {
    return this.root.getHtml();
  }

  getPlain() {
    return this.root.getPlain();
  }
}

class Parser {
  constructor(md = "") {
    this._md = md.trim();
    this._tree = new Tree();
    this._lines = this._md.split("\n");
    this._buildTree();
  }

  _buildTree() {
    let node;
    let bqRe = new RegExp(BLOCK_QUOTE_RE);
    this._lines.forEach(line => {
      let match = bqRe.exec(line);
      if (match) {
        node = new BlockQuoteNode(match[2]);
      } else {
        node = new ParagraphNode(line);
      }
      this._tree.root.appendChild(node);
    });
  }

  toHtml() {
    return this._tree.getHtml();
  }

  toPlain() {
    return this._tree.getPlain().trim();
  }
}

export function toHtml(md = "") {
  return new Parser(md).toHtml();
}

export function toPlain(md = "") {
  return new Parser(md).toPlain();
}
