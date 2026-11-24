import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMarkdown } from "./markdown";

function html(markdown: string): string {
  return renderMarkdown(markdown).map((node) => renderToStaticMarkup(node)).join("");
}

test("unordered list lines render as ul li elements", () => {
  assert.equal(html("- one\n- two"), "<ul><li>one</li><li>two</li></ul>");
});

test("ordered list lines render as ol li elements", () => {
  assert.equal(html("1. first\n2. second"), "<ol><li>first</li><li>second</li></ol>");
});

test("list items preserve inline strong and link elements", () => {
  const markup = html("- **bold** [link](https://example.com)");
  assert.equal(markup, '<ul><li><strong>bold</strong> <a href="https://example.com">link</a></li></ul>');
});
