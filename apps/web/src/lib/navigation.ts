import type { CrmRole } from "@/lib/crm-auth";
import type { IconName } from "@/ui/icons";

export type NavGroup = "Work" | "Documents" | "Content" | "Admin";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  group: NavGroup;
  roles: CrmRole[];
}

export const navGroups: NavGroup[] = ["Work", "Documents", "Content", "Admin"];

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "shield", group: "Work", roles: ["admin", "editor", "viewer"] },
  { id: "leads", label: "Leads", href: "/leads", icon: "search", group: "Work", roles: ["admin", "editor", "viewer"] },
  { id: "contact-requests", label: "Contact requests", href: "/contact-requests", icon: "inbox", group: "Work", roles: ["admin", "editor", "viewer"] },
  { id: "documents", label: "Documents", href: "/documents", icon: "file", group: "Documents", roles: ["admin", "editor", "viewer"] },
  { id: "cms", label: "CMS", href: "/cms", icon: "edit", group: "Content", roles: ["admin", "editor"] },
  { id: "site", label: "Site settings", href: "/cms/site", icon: "calendar", group: "Content", roles: ["admin", "editor"] },
  { id: "review", label: "Review queue", href: "/leads/review", icon: "eye", group: "Admin", roles: ["admin"] },
  { id: "sources", label: "Sources", href: "/leads/sources", icon: "refresh", group: "Admin", roles: ["admin"] },
  { id: "dnc", label: "DNC", href: "/settings/dnc", icon: "shield", group: "Admin", roles: ["admin"] },
];

export const extraCommandRoutes: NavItem[] = [
  { id: "new-lead", label: "Create lead", href: "/leads/new", icon: "plus", group: "Work", roles: ["admin", "editor", "viewer"] },
  { id: "new-document", label: "Create document", href: "/documents/new", icon: "plus", group: "Documents", roles: ["admin", "editor", "viewer"] },
  { id: "new-post", label: "Create post", href: "/cms/posts/new", icon: "plus", group: "Content", roles: ["admin", "editor"] },
];

export function visibleNavigation(role: CrmRole | null | undefined) {
  return navGroups
    .map((group) => ({
      group,
      items: navItems.filter((item) => item.group === group && role && item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}

export function isActiveNavItem(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function breadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "Home", href: "/dashboard" }];
  if (segments.length === 0) return items;

  const matched = navItems.find((item) => isActiveNavItem(pathname, item.href));
  if (matched) {
    if (matched.href !== "/dashboard") items.push({ label: matched.label, href: matched.href });
    const remainder = pathname.slice(matched.href.length).split("/").filter(Boolean);
    if (remainder[0] === "new") items.push({ label: "New" });
    else if (remainder[0] === "posts") {
      items.push({ label: "Posts", href: "/cms" });
      if (remainder[1] === "new") items.push({ label: "New" });
      else if (remainder[1]) items.push({ label: "Edit" });
    } else if (remainder[0]) {
      items.push({ label: remainder[0] === "edit" ? "Edit" : "Detail" });
    }
    return items;
  }

  const labels: Record<string, string> = {
    leads: "Leads",
    cms: "CMS",
    documents: "Documents",
    settings: "Settings",
  };
  let href = "";
  segments.forEach((segment, index) => {
    href += `/${segment}`;
    items.push({
      label: labels[segment] ?? (index === segments.length - 1 ? "Detail" : segment),
      href: index === segments.length - 1 ? undefined : href,
    });
  });
  return items;
}

export function pageTitleForPath(pathname: string) {
  const matched = navItems.find((item) => isActiveNavItem(pathname, item.href));
  if (matched) return matched.label;
  const last = pathname.split("/").filter(Boolean).pop();
  if (!last) return "Dashboard";
  if (last === "new") return "New";
  if (last === "edit") return "Edit";
  return last.charAt(0).toUpperCase() + last.slice(1);
}
