import re

_LOOKBEHINDS = r"((?<=^)|(?<=\s)|(?<=[!.,;:?]))"
_LOOKAHEADS = r"(?=\s|$|[!.,;:?])"

_STRONG = r"\*(\S[^*]*\S)\*"
_ITAL = r"_(\S[^_]*\S)_"

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

    print("extract_first_node in normal module")
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

    def add_runs(self, p):
        raise NotImplemented("Subclasses of Node must implement this add_run")

    def get_html(self):
        return "".join([child.get_html() for child in self.children])

    def __repr__(self):
        return f"<{self.__class__.__name__} \"{self.content}\">"


class RootNode(Node):

    def write_to_doc(self, doc):
        for child in self.children:
            child.write_to_doc(doc)
        return doc


class TextNode(Node):

    is_leaf_node = True

    def add_runs(self, p):
        p.add_run(self.content)
        return p

    def get_html(self):
        return self.content


class ItalNode(Node):

    def add_runs(self, p):
        for child in self.children:
            run = p.add_run(child.content)
            run.italic = True
            if type(child) is StrongNode:
                run.bold = True
        return p

    def get_html(self):
        child_contents = "".join([child.get_html() for child in self.children])
        return f"<i>{child_contents}</i>"


class StrongNode(Node):

    def add_runs(self, p):
        for child in self.children:
            run = p.add_run(child.content)
            run.bold = True
            if type(child) is ItalNode:
                run.italic = True
        return p

    def get_html(self):
        child_contents = "".join([child.get_html() for child in self.children])
        return f"<strong>{child_contents}</strong>"


class ParagraphNode(Node):

    def write_to_doc(self, doc):
        p = doc.add_paragraph()
        for child in self.children:
            p = child.add_runs(p)

    def get_html(self):
        child_contents = "".join([child.get_html() for child in self.children])
        return f"<p>{child_contents}</p>"


class Tree:

    def __init__(self):
        self.root: RootNode = RootNode()

    def append_to_doc(self, doc):
        return self.root.write_to_doc(doc)

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

    def append_to_doc(self, doc):
        return self._tree.append_to_doc(doc)


if __name__ == "__main__":
    document = Document()
    _md = (
        "this is a story about _Hans_\n"
        "*he _IS_ a good dog!*\n"
        "_but_ ... he can also _be *BAD*_\n"
    )
    document = DumbDown(md=_md).append_to_doc(document)
    document.save('demo.docx')
