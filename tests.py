from .simpledown import SimpleDown, Node, Tree, extract_first_node


def test_converts_lines_to_p_tags():
    md = "This is one line\nThis is another"
    assert SimpleDown(md).to_html() == "<p>This is one line</p><p>This is another</p>"


def test_wraps_star_text_in_strong_easy():
    md = "*hans* and"
    assert SimpleDown(md).to_html() == "<p><strong>hans</strong> and</p>"


def test_does_not_wrap_detached_stars_in_strong():
    md = " * not* and mr*hi*"
    assert SimpleDown(md).to_html() == "<p> * not* and mr*hi*</p>"


def test_wraps_star_text_in_strong_harder():
    md = "*hans* and *franz*"
    assert SimpleDown(md).to_html() == "<p><strong>hans</strong> and <strong>franz</strong></p>"


def test_wraps_underscore_text_in_i_easy():
    md = "_hans_ and"
    assert SimpleDown(md).to_html() == "<p><i>hans</i> and</p>"


def test_does_not_wrap_detached_underscores_in_i():
    md = " _ not_ and mr_hi_"
    assert SimpleDown(md).to_html() == "<p> _ not_ and mr_hi_</p>"


def test_wraps_underscore_text_in_i_harder():
    md = "_hans_ and _franz_"
    assert SimpleDown(md).to_html() == "<p><i>hans</i> and <i>franz</i></p>"


def test_handles_nested_formatting():
    md = "*_hans_ and _franz_*"
    assert SimpleDown(md).to_html() == "<p><strong><i>hans</i> and <i>franz</i></strong></p>"


def test_extract_first_node_gets_strong():
    input_string = "*hans the _dog_* and frank"
    node, rest = extract_first_node(input_string)
    assert node._text == "hans the _dog_"
    assert node._node_type == Node.STRONG
    assert rest == " and frank"


def test_extract_first_node_gets_ital():
    input_string = "_hans the *dog*_ and frank"
    node, rest = extract_first_node(input_string)
    assert node._text == "hans the *dog*"
    assert node._node_type == Node.ITALICS
    assert rest == " and frank"


def test_extract_first_node_gets_text():
    input_string = "hans and frank"
    node, rest = extract_first_node(input_string)
    assert node._text == "hans and frank"
    assert node._node_type == Node.TEXT
    assert rest == ""


def test_extract_first_node_gets_text_when_strong_next():
    input_string = "hans *and* frank"
    node, rest = extract_first_node(input_string)
    assert node._text == "hans "
    assert node._node_type == Node.TEXT
    assert rest == "*and* frank"


def test_simple_tree_construction():
    tree = Tree()
    p1 = Node(Node.PARAGRAPH)
    text1 = Node(Node.TEXT, "hi there!")
    p1.append_child(text1)

    p2 = Node(Node.PARAGRAPH)
    text2 = Node(Node.TEXT, "well hi to you!")
    p2.append_child(text2)

    tree.root.append_child(p1)
    tree.root.append_child(p2)

    assert tree.get_html() == "<p>hi there!</p><p>well hi to you!</p>"
