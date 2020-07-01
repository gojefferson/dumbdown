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
        }
        else {
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
        }
        else {
            return this.start_index + this._m[0].length;
        }
    }
    get content() {
        if (!this._m) {
            return null;
        }
        else {
            return this._m[5];
        }
    }
}
function extract_first_node(inputString) {
    const strong = new ReAdapter(STRONG_RE, inputString);
    const ital = new ReAdapter(ITAL_RE, inputString);
    if (strong.start_index === 0) {
        return [
            new StrongNode(strong.content),
            inputString.slice(strong.end_index)
        ];
    }
    if (ital.start_index === 0) {
        return [new ItalNode(ital.content), inputString.slice(ital.end_index)];
    }
    if (!strong.start_index && !ital.start_index) {
        return [new TextNode(inputString), ""];
    }
    const _max = inputString.length;
    const split_point = Math.min(strong.start_index || _max, ital.start_index || _max);
    return [
        new TextNode(inputString.slice(0, split_point)),
        inputString.slice(split_point)
    ];
}
class BaseNode {
    constructor(content = "") {
        this.content = "";
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
class ParentNode extends BaseNode {
    constructor(content) {
        super(content);
        this.parentTag = undefined;
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
        }
        else {
            return childContents.trim();
        }
    }
}
class ItalNode extends ParentNode {
    constructor(content) {
        super(content);
        this.parentTag = "i";
    }
}
class StrongNode extends ParentNode {
    constructor(content) {
        super(content);
        this.parentTag = "strong";
    }
}
class ParagraphNode extends ParentNode {
    constructor(content) {
        super(content);
        this.blockElement = true;
        this.parentTag = "p";
    }
}
class BlockQuoteNode extends ParentNode {
    constructor(content) {
        super(content);
        this.blockElement = true;
        this.parentTag = "blockquote";
    }
}
class Tree {
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
            }
            else {
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
