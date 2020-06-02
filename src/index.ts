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
  _regex: RegExp;
  _m: RegExpExecArray | null;

  constructor(regex: string, string: string) {
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
      return this.start_index! + this._m[0].length;
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

function extract_first_node(inputString: string): [Node, string] {
  const strong: ReAdapter = new ReAdapter(STRONG_RE, inputString);
  const ital: ReAdapter = new ReAdapter(ITAL_RE, inputString);

  if (strong.start_index === 0) {
    return [
      new StrongNode(strong.content!),
      inputString.slice(strong.end_index!)
    ];
  }

  if (ital.start_index === 0) {
    return [new ItalNode(ital.content!), inputString.slice(ital.end_index!)];
  }

  if (!strong.start_index && !ital.start_index) {
    return [new TextNode(inputString), ""];
  }

  const _max: number = inputString.length;
  const split_point: number = Math.min(strong.start_index || _max, ital.start_index || _max);
  return [
    new TextNode(inputString.slice(0, split_point)),
    inputString.slice(split_point)
  ];
}

interface Node {
  content: string;
  getPlain: () => string;
  getHtml: () => string;
}

class BaseNode implements Node {
  content: string = "";
  is_leaf_node: boolean;
  children: any[];

  constructor(content = "") {
    let node: Node;
    this.children = [];
    this.is_leaf_node = false;
    if (!this.is_leaf_node) {
      while (content !== "") {
        [node, content] = extract_first_node(content);
        this.appendChild(node);
      }
    }
  }

  appendChild(node: Node) {
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

class TextNode implements Node {
  content: string;
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

class ParentNode extends BaseNode {
  parentTag?: string;
  blockElement: boolean;
  constructor(content: string) {
    super(content);
    this.parentTag = undefined;
    this.blockElement = false;
  }

  getPlain(): string {
    let childContents = this.children.reduce((accum, child) => {
      return accum + child.getPlain();
    }, "");
    if (this.blockElement) {
      return `${childContents.trim()} `;
    }
    return childContents.trim();
  }

  getHtml(): string {
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
  constructor(content: string) {
    super(content);
    this.parentTag = "i";
  }
}

class StrongNode extends ParentNode {
  constructor(content: string) {
    super(content);
    this.parentTag = "strong";
  }
}

class ParagraphNode extends ParentNode {
  constructor(content: string) {
    super(content);
    this.blockElement = true;
    this.parentTag = "p";
  }
}

class BlockQuoteNode extends ParentNode {
  constructor(content: string) {
    super(content);
    this.blockElement = true;
    this.parentTag = "blockquote";
  }
}

class Tree {
  root: BaseNode;
  constructor() {
    this.root = new BaseNode();
  }

  getHtml() {
    return this.root.getHtml();
  }

  getPlain() {
    return this.root.getPlain();
  }
}

class Parser {
  _md: string;
  _tree: Tree;
  _lines: string[];

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

/**
 * Parse a dumbdown-formatted string and receive back valid HTML with:
 * - line breaks starting new <p> tags
 * - text surrounded by _ characters surrounded by <i>
 * - text surrounded by * characters surrounded by <strong>
 * - lines starting with > starting <blockquote> tags
 * @param md the string you wish to parse.
 */
export function toHtml(md = "") {
  return new Parser(md).toHtml();
}

/**
 * Parse a dumbdown formatted string and get back plain text with formatting
 * marks removed.
 * @param md the dumbdown-formatted string
 */
export function toPlain(md = "") {
  return new Parser(md).toPlain();
}
