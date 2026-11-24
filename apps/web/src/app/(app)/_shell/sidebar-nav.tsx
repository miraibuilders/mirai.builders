"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CrmRole } from "@/lib/crm-auth";
import { isActiveNavItem, visibleNavigation } from "@/lib/navigation";
import { Icon } from "@/ui/icons";

export function SidebarNav({ role, onNavigate }: { role: CrmRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="ui-sidebar-nav" aria-label="Main navigation">
      {visibleNavigation(role).map((group) => (
        <section className="ui-sidebar-group" key={group.group}>
          <h2>{group.group}</h2>
          <ul>
            {group.items.map((item) => {
              const active = isActiveNavItem(pathname, item.href);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    data-active={active ? "true" : undefined}
                    onClick={onNavigate}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
