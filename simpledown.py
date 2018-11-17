import re


STRONG_RE = r"((?<=^)|(?<=\s))\*(\S[^*]*\S)\*(?=\s|$)"

ITAL_RE = r"((?<=^)|(?<=\s))_(\S[^_]*\S)_(?=\s|$)"


class ReAdapter:

    def __init__(self, regex, string):
        self._regex = regex
        self._string = string
        self._m = re.search(regex, string)

    @property
    def start_index(self):
        if not self._m:
            None
        else:
            # span is the start and end indices of string for everything, including the
            # formatting marks, ie = "*hans*" from "franz and *hans*"
            return self._m.span()[0]

    @property
    def end_index(self):
        if not self._m:
            None
        else:
            # span is the start and end indices of string for everything, including the
            # formatting marks, ie = "*hans*" from "franz and *hans*"
            return self._m.span()[1]

    @property
    def content(self):
        if not self._m:
            None
        else:
            # the _second_ group is the one we want
            return self._m.groups()[1]


def extract_first_node(input_string):
    strong = ReAdapter(STRONG_RE, input_string)
    ital = ReAdapter(ITAL_RE, input_string)

    if strong.start_index == 0:
        return (Node(Node.STRONG, text=strong.content), input_string[strong.end_index:])

    if ital.start_index == 0:
        return (Node(Node.ITALICS, text=ital.content), input_string[ital.end_index:])

    # we have no matches
    if not strong.start_index and not ital.start_index:
        return (Node(Node.TEXT, text=input_string), "")

    _max = len(input_string)
    split_point = min(strong.start_index or _max, ital.start_index or _max)
    return (Node(Node.TEXT, text=input_string[:split_point]), input_string[split_point:])


class Node:

    NULL = 0
    PARAGRAPH = 1
    STRONG = 2
    ITALICS = 3
    TEXT = 4

    def __init__(self, node_type, text=""):
        self._node_type = node_type
        self._text = text
        self._children = []
        self._parent = None
        if self._node_type != Node.TEXT:
            while text != "":
                node, text = extract_first_node(text)
                self.append_child(node)

    def append_child(self, node):
        node._parent = self
        self._children.append(node)

    def get_content(self):
        if self._node_type == Node.TEXT:
            return self._text
        child_contents = "".join([child.get_content() for child in self._children])
        if self._node_type == Node.PARAGRAPH:
            return f"<p>{child_contents}</p>"
        if self._node_type == Node.STRONG:
            return f"<strong>{child_contents}</strong>"
        if self._node_type == Node.ITALICS:
            return f"<i>{child_contents}</i>"
        return child_contents

    def __repr__(self):
        return f"<Node type={self._node_type}, text=\"{self._text}\">"


class Tree:

    def __init__(self):
        self.root = Node(Node.NULL)

    def get_html(self):
        return self.root.get_content()


class SimpleDown:

    def __init__(self, md=""):
        self._md = md
        self._tree = Tree()
        self._lines = []

    def _build_tree(self):
        for line in self._lines:
            p = Node(Node.PARAGRAPH, text=line)
            self._tree.root.append_child(p)

    def to_html(self):
        self._lines = self._md.split("\n")
        self._build_tree()
        return self._tree.get_html()
