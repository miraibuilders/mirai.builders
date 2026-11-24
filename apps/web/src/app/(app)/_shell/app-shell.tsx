"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { AppUser } from "@/lib/app-user";
import type { CrmRole } from "@/lib/crm-auth";
import { Drawer } from "@/ui";
import { CommandPalette } from "./command-palette";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { SidebarNav } from "./sidebar-nav";
import { TopBar } from "./top-bar";

export function AppShell({ user, role, children }: { user: AppUser; role: CrmRole; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const togglePalette = useCallback(() => setPaletteOpen((value) => !value), []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <>
      <a className="ui-skip-link" href="#main-content">Skip to main content</a>
      <div className="ui-app-shell">
        <aside className="ui-sidebar" aria-label="Sidebar">
          <div className="ui-sidebar-brand">
            <span className="ui-sidebar-brand-mark"><span>MIRAI Lab</span></span>
            <span className="ui-sidebar-brand-sub ui-sidebar-brand-tag">Internal</span>
          </div>
          <SidebarNav role={role} />
        </aside>
        <div className="ui-app-main">
          <TopBar user={user} role={role} onOpenMobileNav={() => setMobileNavOpen(true)} onOpenPalette={() => setPaletteOpen(true)} />
          <main className="ui-app-content" id="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      <MobileBottomBar role={role} />
      <Drawer open={mobileNavOpen} onClose={closeMobileNav} title="Navigation" side="left">
        <SidebarNav role={role} onNavigate={closeMobileNav} />
      </Drawer>
      <CommandPalette open={paletteOpen} onClose={closePalette} onToggle={togglePalette} role={role} />
    </>
  );
}
