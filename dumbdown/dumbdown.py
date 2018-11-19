import re

_LOOKBEHINDS = r"((?<=^)|(?<=\s)|(?<=[!.,;:?]))"
_LOOKAHEADS = r"(?=\s|$|[!.,;:?])"

_STRONG_TERMINALS = r"[a-zA-Z0-9!_()]"
_ITAL_TERMINALS = r"[a-zA-Z0-9!*()]"
_STRONG = r"\*(" + _STRONG_TERMINALS + r"[^*]*" + _STRONG_TERMINALS + r")\*"
_ITAL = r"_(" + _ITAL_TERMINALS + r"[^_]*" + _ITAL_TERMINALS + r")_"

STRONG_RE = _LOOKBEHINDS + _STRONG + _LOOKAHEADS
ITAL_RE = _LOOKBEHINDS + _ITAL + _LOOKAHEADS


class ReAdapter:

    def __init__(self, regex, string):
        self._regex = regex
        self._string = string
        self._m = re.search(regex, string)

    @property
    def start_index(self):
        if not self._m:
            return None
        else:
            # span is the start and end indices of string for everything, including the
            # formatting marks, ie = "*hans*" from "franz and *hans*"
            return self._m.span()[0]

    @property
    def end_index(self):
        if not self._m:
            return None
        else:
            # span is the start and end indices of string for everything, including the
            # formatting marks, ie = "*hans*" from "franz and *hans*"
            return self._m.span()[1]

    @property
    def content(self):
        if not self._m:
            return None
        else:
            # the _second_ group is the one we want
            return self._m.groups()[1]


def extract_first_node(input_string):
    strong = ReAdapter(STRONG_RE, input_string)
    ital = ReAdapter(ITAL_RE, input_string)

    if strong.start_index == 0:
        return StrongNode(content=strong.content), input_string[strong.end_index:]

    if ital.start_index == 0:
        return ItalNode(content=ital.content), input_string[ital.end_index:]

    # we have no matches
    if not strong.start_index and not ital.start_index:
        return TextNode(content=input_string), ""

    _max = len(input_string)
    split_point = min(strong.start_index or _max, ital.start_index or _max)
    return TextNode(content=input_string[:split_point]), input_string[split_point:]


class Node:

    is_leaf_node = False

    def __init__(self, content=""):
        self.content = content
        self.children = []
        if not self.is_leaf_node:
            while content != "":
                node, content = extract_first_node(content)
                self.append_child(node)

    def append_child(self, node):
        self.children.append(node)

    def get_html(self):
        return "".join([child.get_html() for child in self.children])

    def __repr__(self):
        return f"<{self.__class__.__name__} \"{self.content}\">"


class TextNode(Node):

    is_leaf_node = True

    def get_html(self):
        return self.content


class ParentNode(Node):

    parent_tag = "UNDEFINED"

    def get_html(self):
        child_contents = "".join([child.get_html() for child in self.children])
        return f"<{self.parent_tag}>{child_contents}</{self.parent_tag}>"


class ItalNode(ParentNode):

    parent_tag = "i"


class StrongNode(ParentNode):

    parent_tag = "strong"


class ParagraphNode(ParentNode):

    parent_tag = "p"


class Tree:

    def __init__(self):
        self.root = Node()

    def get_html(self):
        return self.root.get_html()


class DumbDown:

    def __init__(self, md=""):
        self._md = md
        self._tree = Tree()
        self._lines = self._md.split("\n")
        self._build_tree()

    def _build_tree(self):
        for line in self._lines:
            p = ParagraphNode(content=line)
            self._tree.root.append_child(p)

    def to_html(self):
        return self._tree.get_html()
