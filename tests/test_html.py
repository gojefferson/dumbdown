from dumbdown.dumbdown import (
    DumbDown,
    Tree,
    extract_first_node,
    ParagraphNode,
    TextNode,
    ItalNode,
    StrongNode,
)


def test_converts_lines_to_p_tags():
    md = "This is one line\nThis is another"
    assert DumbDown(md).to_html() == "<p>This is one line</p><p>This is another</p>"


def test_wraps_star_text_in_strong_easy():
    md = "*hans* and"
    assert DumbDown(md).to_html() == "<p><strong>hans</strong> and</p>"


def test_wraps_star_text_in_strong_ending_in_punctuation():
    md = "and ... *hans*!"
    assert DumbDown(md).to_html() == "<p>and ... <strong>hans</strong>!</p>"


def test_wraps_star_text_in_strong_starting_and_ending_in_punctuation():
    md = "and ... !*hans*!"
    assert DumbDown(md).to_html() == "<p>and ... !<strong>hans</strong>!</p>"


def test_does_not_wrap_detached_stars_in_strong():
    md = " * not* and mr*hi*"
    assert DumbDown(md).to_html() == "<p> * not* and mr*hi*</p>"


def test_wraps_star_text_in_strong_harder():
    md = "*hans* and *franz*"
    assert DumbDown(md).to_html() == "<p><strong>hans</strong> and <strong>franz</strong></p>"


def test_wraps_underscore_text_in_i_easy():
    md = "_hans_ and"
    assert DumbDown(md).to_html() == "<p><i>hans</i> and</p>"


def test_does_not_wrap_detached_underscores_in_i():
    md = " _ not_ and mr_hi_"
    assert DumbDown(md).to_html() == "<p> _ not_ and mr_hi_</p>"


def test_wraps_underscore_text_in_i_harder():
    md = "_hans_ and _franz_"
    assert DumbDown(md).to_html() == "<p><i>hans</i> and <i>franz</i></p>"


def test_handles_nested_formatting_strong_outer():
    md = "*_hans_ and _franz_*"
    assert DumbDown(md).to_html() == "<p><strong><i>hans</i> and <i>franz</i></strong></p>"


def test_handles_nested_formatting_ital_outer():
    md = "_*hans* and *franz*_"
    assert DumbDown(md).to_html() == "<p><i><strong>hans</strong> and <strong>franz</strong></i></p>"


def test_handles_nested_formatting_ital_outer_multiline():
    md = "_*hans* is_\nstrong"
    assert DumbDown(md).to_html() == "<p><i><strong>hans</strong> is</i></p><p>strong</p>"


def test_handles_nested_formatting_exact_matching_ital():
    md = "_*hans*_"
    assert DumbDown(md).to_html() == "<p><i><strong>hans</strong></i></p>"


def test_handles_nested_formatting_exact_matching_strong():
    md = "*_hans_*"
    assert DumbDown(md).to_html() == "<p><strong><i>hans</i></strong></p>"


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
