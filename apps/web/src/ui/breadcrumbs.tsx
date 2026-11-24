import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/navigation";

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={["ui-breadcrumbs", className].filter(Boolean).join(" ")}>
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} aria-current={index === items.length - 1 ? "page" : undefined}>
            {item.href && index !== items.length - 1 ? <Link href={item.href}>{item.label}</Link> : item.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}
