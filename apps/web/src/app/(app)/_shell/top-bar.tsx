"use client";

import { usePathname } from "next/navigation";
import type { AppUser } from "@/lib/app-user";
import type { CrmRole } from "@/lib/crm-auth";
import { breadcrumbsForPath } from "@/lib/navigation";
import { Breadcrumbs, Button, Icon } from "@/ui";
import { AccountMenu } from "./account-menu";

export function TopBar({
  user,
  role,
  onOpenMobileNav,
  onOpenPalette,
}: {
  user: AppUser;
  role: CrmRole;
  onOpenMobileNav: () => void;
  onOpenPalette: () => void;
}) {
  const pathname = usePathname();
  return (
    <header className="ui-topbar">
      <Button
        variant="ghost"
        iconOnly
        icon="menu"
        aria-label="Open navigation"
        className="ui-topbar-menu"
        onClick={onOpenMobileNav}
      />
      <div className="ui-topbar-breadcrumbs">
        <Breadcrumbs items={breadcrumbsForPath(pathname)} />
      </div>
      <div className="ui-topbar-actions">
        <Button
          variant="secondary"
          className="ui-command-trigger"
          aria-label="Open command palette"
          aria-keyshortcuts="Meta+K Control+K"
          onClick={onOpenPalette}
        >
          <Icon name="search" />
          <span className="ui-command-trigger-text">Search</span>
          <kbd className="ui-kbd">⌘K</kbd>
        </Button>
        <AccountMenu user={user} role={role} />
      </div>
    </header>
  );
}
