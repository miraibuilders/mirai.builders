import * as React from "react";
import type { ReactNode } from "react";

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
const LIST_ITEM = /^([-*]|\d+\.)\s+(.*)$/;

type ListItem = { marker: string; text: string; children: ListItem[] };

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (link) {
        const href = link[2];
        if (/^(https?:\/\/|\/)/.test(href)) {
          return (
            <a key={key} href={href}>
              {link[1]}
            </a>
          );
        }
        return link[1];
      }
      return part;
    });
}

function isOrdered(marker: string): boolean {
  return /^\d+\.$/.test(marker);
}

function renderList(items: ListItem[], keyPrefix: string): ReactNode {
  const Tag = isOrdered(items[0].marker) ? "ol" : "ul";
  return (
    <Tag key={keyPrefix}>
      {items.map((item, index) => {
        const key = `${keyPrefix}-${index}`;
        return (
          <li key={key}>
            {renderInline(item.text, key)}
            {item.children.length > 0 ? renderList(item.children, `${key}-nested`) : null}
          </li>
        );
      })}
    </Tag>
  );
}

function groupByType(items: ListItem[]): ListItem[][] {
  const groups: ListItem[][] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && isOrdered(last[0].marker) === isOrdered(item.marker)) last.push(item);
    else groups.push([item]);
  }
  return groups;
}

export function renderMarkdown(markdown: string): ReactNode[] {
  const blocks = markdown.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const output: ReactNode[] = [];

  blocks.forEach((block, blockIndex) => {
    const rawLines = block.split("\n").filter((line) => line.trim().length > 0);
    const lines = rawLines.map((line) => line.trim());
    if (lines.length === 0) return;

    const heading = /^(#{2,3})\s+(.*)$/;
    if (lines.every((line) => heading.test(line))) {
      lines.forEach((line, lineIndex) => {
        const match = heading.exec(line);
        if (!match) return;
        const key = `h-${blockIndex}-${lineIndex}`;
        const content = renderInline(match[2], key);
        output.push(
          match[1] === "##" ? (
            <h2 key={key}>{content}</h2>
          ) : (
            <h3 key={key}>{content}</h3>
          ),
        );
      });
      return;
    }

    if (lines.every((line) => LIST_ITEM.test(line))) {
      const items: ListItem[] = [];
      rawLines.forEach((raw) => {
        const match = LIST_ITEM.exec(raw.trim());
        if (!match) return;
        const item: ListItem = { marker: match[1], text: match[2], children: [] };
        if (/^ {2,}/.test(raw) && items.length > 0) items[items.length - 1].children.push(item);
        else items.push(item);
      });
      groupByType(items).forEach((group, groupIndex) => {
        output.push(renderList(group, `list-${blockIndex}-${groupIndex}`));
      });
      return;
    }

    const key = `p-${blockIndex}`;
    output.push(<p key={key}>{renderInline(lines.join(" "), key)}</p>);
  });

  return output;
}
