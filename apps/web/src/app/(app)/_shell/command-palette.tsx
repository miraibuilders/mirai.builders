"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { CrmRole } from "@/lib/crm-auth";
import { extraCommandRoutes, visibleNavigation } from "@/lib/navigation";
import { signOut } from "@/lib/sign-out";
import { Button, Icon, Input, Modal, type IconName } from "@/ui";

interface Command {
  id: string;
  label: string;
  group: string;
  keywords: string;
  icon: IconName;
  run: () => void | Promise<void>;
}

export function CommandPalette({
  open,
  onClose,
  onToggle,
  role,
}: {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
  role: CrmRole;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const allowed = [...visibleNavigation(role).flatMap((group) => group.items), ...extraCommandRoutes].filter(
      (item) => role && item.roles.includes(role),
    );
    return [
      ...allowed.map((item) => ({
        id: item.id,
        label: item.label,
        group: item.group,
        keywords: `${item.label} ${item.href} ${item.group}`,
        icon: item.icon,
        run: () => router.push(item.href),
      })),
      {
        id: "sign-out",
        label: "Sign out",
        group: "Session",
        keywords: "sign out logout account",
        icon: "external-link",
        run: signOut,
      },
    ];
  }, [role, router]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) => command.keywords.toLowerCase().includes(needle));
  }, [commands, query]);

  useEffect(() => {
    setSelected(0);
  }, [query, open]);

  useEffect(() => {
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onToggle();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onToggle]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const activate = (command: Command) => {
    onClose();
    void command.run();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = results[selected];
      if (command) activate(command);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Command palette"
      description="Navigation and actions you can already access."
      size="lg"
      variant="palette"
      initialFocus="first-field"
    >
      <Input
        role="combobox"
        aria-label="Search commands"
        aria-expanded="true"
        aria-controls="ui-command-list"
        aria-autocomplete="list"
        aria-activedescendant={results[selected] ? `ui-command-${results[selected].id}` : undefined}
        placeholder="Search commands"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleInputKeyDown}
      />
      {results.length === 0 ? (
        <p className="ui-command-empty">No matching commands</p>
      ) : (
        <ul className="ui-command-list" id="ui-command-list" role="listbox" aria-label="Commands">
          {results.map((command, index) => (
            <li
              key={command.id}
              id={`ui-command-${command.id}`}
              role="option"
              aria-selected={index === selected}
              data-selected={index === selected ? "true" : undefined}
              data-group={command.group}
              onMouseEnter={() => setSelected(index)}
              onClick={() => activate(command)}
            >
              <span className="ui-command-group" aria-hidden="true">{command.group}</span>
              <Icon name={command.icon} />
              <span className="ui-command-label">{command.label}</span>
              <span className="ui-command-shortcut" aria-hidden="true">↵</span>
            </li>
          ))}
        </ul>
      )}
      <div className="ui-command-footer">
        <span>↑↓ to navigate · Enter to open · Escape to close</span>
        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}
