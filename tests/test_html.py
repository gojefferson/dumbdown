import json

from dumbdown.html import (
    ItalNode,
    ParagraphNode,
    Parser,
    StrongNode,
    TextNode,
    Tree,
    extract_first_node,
)


def test_json_examples():
    with open("test_examples.json") as json_file:
        examples = json.loads(json_file.read())
        for example in examples:
            assert Parser(example["md"]).to_html() == example["html"]


def test_extract_first_node_gets_strong():
    input_string = "*hans the _dog_* and frank"
    node, rest = extract_first_node(input_string)
    assert node.content == "hans the _dog_"
    assert type(node) is StrongNode
    assert rest == " and frank"


def test_extract_first_node_gets_ital():
    input_string = "_hans the *dog*_ and frank"
    node, rest = extract_first_node(input_string)
    assert node.content == "hans the *dog*"
    assert type(node) is ItalNode
    assert rest == " and frank"


def test_extract_first_node_gets_text():
    input_string = "hans and frank"
    node, rest = extract_first_node(input_string)
    assert node.content == "hans and frank"
    assert type(node) is TextNode
    assert rest == ""


def test_extract_first_node_gets_text_when_strong_next():
    input_string = "hans *and* frank"
    node, rest = extract_first_node(input_string)
    assert node.content == "hans "
    assert type(node) is TextNode
    assert rest == "*and* frank"


def test_simple_tree_construction():
    tree = Tree()
    p1 = ParagraphNode()
    text1 = TextNode("hi there!")
    p1.append_child(text1)

    p2 = ParagraphNode()
    text2 = TextNode("well hi to you!")
    p2.append_child(text2)

    tree.root.append_child(p1)
    tree.root.append_child(p2)

    assert tree.get_html() == "<p>hi there!</p><p>well hi to you!</p>"
