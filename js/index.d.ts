/**
 * Initially created with help of Python to ES6 converter:
 * - https://github.com/metapensiero/metapensiero.pj#usage
 *
 * Then ... cleaned up A LOT to get it to run properly.
 */
/**
 * Parse a dumbdown-formatted string and receive back valid HTML with:
 * - line breaks starting new <p> tags
 * - text surrounded by _ characters surrounded by <i>
 * - text surrounded by * characters surrounded by <strong>
 * - lines starting with > starting <blockquote> tags
 * @param md the string you wish to parse.
 */
export declare function toHtml(md?: string): any;
/**
 * Parse a dumbdown formatted string and get back plain text with formatting
 * marks removed.
 * @param md the dumbdown-formatted string
 */
export declare function toPlain(md?: string): any;
