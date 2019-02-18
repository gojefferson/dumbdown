from abc import ABC

from .html import (
    ITAL_RE,
    STRONG_RE,
    ItalNode,
    Node,
    ParagraphNode,
    Parser,
    ReAdapter,
    StrongNode,
    TextNode,
    Tree,
)


def extract_first_node(input_string):
    strong = ReAdapter(STRONG_RE, input_string)
    ital = ReAdapter(ITAL_RE, input_string)

    if strong.start_index == 0:
        return DocxStrongNode(content=strong.content), input_string[strong.end_index :]

    if ital.start_index == 0:
        return DocxItalNode(content=ital.content), input_string[ital.end_index :]

    # we have no matches
    if not strong.start_index and not ital.start_index:
        return DocxTextNode(content=input_string), ""

    _max = len(input_string)
    split_point = min(strong.start_index or _max, ital.start_index or _max)
    return DocxTextNode(content=input_string[:split_point]), input_string[split_point:]


class DocxNode(Node):
    def __init__(self, content=""):
        self.content = content
        self.children = []
        if not self.is_leaf_node:
            while content != "":
                node, content = extract_first_node(content)
                self.append_child(node)

    def add_runs(self, p):
        raise NotImplementedError("Subclasses of DocxNode must implement `add_runs`")


class DocxRootNode(DocxNode, ABC):
    def write_to_doc(self, doc, paragraph_style=None):
        for child in self.children:
            child.write_to_doc(doc, paragraph_style)
        return doc


class DocxTextNode(TextNode):
    def add_runs(self, p):
        p.add_run(self.content)
        return p


class DocxItalNode(ItalNode, DocxNode):
    def add_runs(self, p):
        for child in self.children:
            run = p.add_run(child.content)
            run.italic = True
            if type(child) is DocxStrongNode:
                run.bold = True
        return p


class DocxStrongNode(StrongNode, DocxNode):
    def add_runs(self, p):
        for child in self.children:
            run = p.add_run(child.content)
            run.bold = True
            if type(child) is DocxItalNode:
                run.italic = True
        return p


class DocxParagraphNode(ParagraphNode, DocxNode):
    def write_to_doc(self, doc, paragraph_style=None):
        p = doc.add_paragraph()
        if paragraph_style:
            p.style = paragraph_style
        for child in self.children:
            p = child.add_runs(p)


class DocxTree(Tree):
    def __init__(self):
        self.root = DocxRootNode()

    def append_to_doc(self, doc, paragraph_style=None):
        return self.root.write_to_doc(doc, paragraph_style)


class DocxParser(Parser):
    def __init__(self, md=""):
        self._md = md
        self._tree = DocxTree()
        self._lines = self._md.split("\n")
        self._build_tree()

    def _build_tree(self):
        for line in self._lines:
            p = DocxParagraphNode(content=line)
            self._tree.root.append_child(p)

    def append_to_doc(self, doc, paragraph_style=None):
        return self._tree.append_to_doc(doc, paragraph_style)


def write_md_to_doc(document, md, strip_newlines=True, numbered=False):
    if strip_newlines or numbered:
        md = md.replace("\n", " ")

    paragraph_style = document.styles["Normal"]

    if numbered:
        paragraph_style = document.styles["List Paragraph"]

    DocxParser(md=md).append_to_doc(document, paragraph_style=paragraph_style)


def confirm_styles_exist_in_document(document, styles):
    missing = []
    for style in styles:
        try:
            document.styles[style]
        except KeyError:
            missing.append(style)
    if len(missing) > 0:
        raise NotImplementedError(
            f"Document is missing the following styles {', '.join(missing)}"
        )
