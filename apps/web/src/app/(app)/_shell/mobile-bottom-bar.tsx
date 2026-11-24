"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CrmRole } from "@/lib/crm-auth";
import { isActiveNavItem, navItems } from "@/lib/navigation";
import { Icon } from "@/ui";

const bottomIds = ["dashboard", "leads", "documents", "cms"] as const;

export function MobileBottomBar({ role }: { role: CrmRole }) {
  const pathname = usePathname();
  const items = bottomIds
    .map((id) => navItems.find((item) => item.id === id))
    .filter((item): item is (typeof navItems)[number] => Boolean(item && role && item.roles.includes(role)));

  return (
    <nav className="ui-mobile-bottom" aria-label="Quick navigation">
      <ul>
        {items.map((item) => {
          const active = isActiveNavItem(pathname, item.href);
          return (
            <li key={item.id}>
              <Link href={item.href} aria-current={active ? "page" : undefined} data-active={active ? "true" : undefined}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
