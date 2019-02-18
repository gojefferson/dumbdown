"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toHtml;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Initially created with help of Python to ES6 converter:
 * - https://github.com/metapensiero/metapensiero.pj#usage
 *
 * Then ... cleaned up A LOT to get it to run properly.
 */
var _LOOKBEHINDS = "((?<=^)|(?<=\\s)|(?<=[!.,;:?]))";
var _LOOKAHEADS = "(?=\\s|$|[!.,;:?])";

var _STRONG = "\\*(" + "[^*]*" + ")\\*";

var _ITAL = "_(" + "[^_]*" + ")_";

var STRONG_RE = _LOOKBEHINDS + _STRONG + _LOOKAHEADS;
var ITAL_RE = _LOOKBEHINDS + _ITAL + _LOOKAHEADS;

var ReAdapter =
/*#__PURE__*/
function () {
  function ReAdapter(regex, string) {
    _classCallCheck(this, ReAdapter);

    this._regex = new RegExp(regex);
    this._m = this._regex.exec(string);
  }

  _createClass(ReAdapter, [{
    key: "start_index",
    get: function get() {
      if (!this._m) {
        return null;
      } else {
        return this._m.index;
      }
    }
  }, {
    key: "end_index",
    get: function get() {
      if (!this._m) {
        return null;
      } else {
        return this._m.index + this._m[0].length;
      }
    }
  }, {
    key: "content",
    get: function get() {
      if (!this._m) {
        return null;
      } else {
        return this._m[2];
      }
    }
  }]);

  return ReAdapter;
}();

function extract_first_node(input_string) {
  var _max, ital, split_point, strong;

  strong = new ReAdapter(STRONG_RE, input_string);
  ital = new ReAdapter(ITAL_RE, input_string);

  if (strong.start_index === 0) {
    return [new StrongNode(strong.content), input_string.slice(strong.end_index)];
  }

  if (ital.start_index === 0) {
    return [new ItalNode(ital.content), input_string.slice(ital.end_index)];
  }

  if (!strong.start_index && !ital.start_index) {
    return [new TextNode(input_string), ""];
  }

  _max = input_string.length;
  split_point = Math.min(strong.start_index || _max, ital.start_index || _max);
  return [new TextNode(input_string.slice(0, split_point)), input_string.slice(split_point)];
}

var Node =
/*#__PURE__*/
function () {
  function Node() {
    var content = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    _classCallCheck(this, Node);

    var node;
    this.children = [];
    this.is_leaf_node = false;

    if (!this.is_leaf_node) {
      while (content !== "") {
        var _extract_first_node = extract_first_node(content);

        var _extract_first_node2 = _slicedToArray(_extract_first_node, 2);

        node = _extract_first_node2[0];
        content = _extract_first_node2[1];
        this.append_child(node);
      }
    }
  }

  _createClass(Node, [{
    key: "append_child",
    value: function append_child(node) {
      this.children.push(node);
    }
  }, {
    key: "get_html",
    value: function get_html() {
      return this.children.reduce(function (html, child) {
        return html + child.get_html();
      }, "");
    }
  }]);

  return Node;
}();

var TextNode =
/*#__PURE__*/
function () {
  function TextNode() {
    var content = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    _classCallCheck(this, TextNode);

    this.content = content;
  }

  _createClass(TextNode, [{
    key: "get_html",
    value: function get_html() {
      return this.content;
    }
  }]);

  return TextNode;
}();

var ParentNode =
/*#__PURE__*/
function (_Node) {
  _inherits(ParentNode, _Node);

  function ParentNode() {
    var _this;

    _classCallCheck(this, ParentNode);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ParentNode).apply(this, arguments));
    _this.parent_tag = "UNDEFINED";
    return _this;
  }

  _createClass(ParentNode, [{
    key: "get_html",
    value: function get_html() {
      var child_contents = this.children.reduce(function (accum, child) {
        return accum + child.get_html();
      }, "");
      return "<".concat(this.parent_tag, ">").concat(child_contents.trim(), "</").concat(this.parent_tag, ">");
    }
  }]);

  return ParentNode;
}(Node);

var ItalNode =
/*#__PURE__*/
function (_ParentNode) {
  _inherits(ItalNode, _ParentNode);

  function ItalNode() {
    var _this2;

    _classCallCheck(this, ItalNode);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(ItalNode).apply(this, arguments));
    _this2.parent_tag = "i";
    return _this2;
  }

  return ItalNode;
}(ParentNode);

var StrongNode =
/*#__PURE__*/
function (_ParentNode2) {
  _inherits(StrongNode, _ParentNode2);

  function StrongNode() {
    var _this3;

    _classCallCheck(this, StrongNode);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(StrongNode).apply(this, arguments));
    _this3.parent_tag = "strong";
    return _this3;
  }

  return StrongNode;
}(ParentNode);

var ParagraphNode =
/*#__PURE__*/
function (_ParentNode3) {
  _inherits(ParagraphNode, _ParentNode3);

  function ParagraphNode() {
    var _this4;

    _classCallCheck(this, ParagraphNode);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(ParagraphNode).apply(this, arguments));
    _this4.parent_tag = "p";
    return _this4;
  }

  return ParagraphNode;
}(ParentNode);

var Tree =
/*#__PURE__*/
function () {
  function Tree() {
    _classCallCheck(this, Tree);

    this.root = new Node();
  }

  _createClass(Tree, [{
    key: "get_html",
    value: function get_html() {
      return this.root.get_html();
    }
  }]);

  return Tree;
}();

var DumbDown =
/*#__PURE__*/
function () {
  function DumbDown() {
    var md = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    _classCallCheck(this, DumbDown);

    this._md = md.trim();
    this._tree = new Tree();
    this._lines = this._md.split("\n");

    this._build_tree();
  }

  _createClass(DumbDown, [{
    key: "_build_tree",
    value: function _build_tree() {
      var _this5 = this;

      var p;

      this._lines.forEach(function (line) {
        p = new ParagraphNode(line);

        _this5._tree.root.append_child(p);
      });
    }
  }, {
    key: "to_html",
    value: function to_html() {
      return this._tree.get_html();
    }
  }]);

  return DumbDown;
}();

function toHtml() {
  var md = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  return new DumbDown(md).to_html();
}