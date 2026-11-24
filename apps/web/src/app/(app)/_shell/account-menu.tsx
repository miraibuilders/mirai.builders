"use client";

import { Avatar, Badge, Button, Icon, Popover } from "@/ui";
import type { AppUser } from "@/lib/app-user";
import type { CrmRole } from "@/lib/crm-auth";
import { signOut } from "@/lib/sign-out";
import { useState } from "react";

export function AccountMenu({ user, role }: { user: AppUser; role: CrmRole }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      label="Account menu"
      trigger={
        <Button
          variant="ghost"
          aria-label={`Account: ${user.name}, ${role}`}
          onClick={() => setOpen((value) => !value)}
        >
          <Avatar name={user.name} size="sm" />
          <span className="ui-account-name">{user.name}</span>
          <Badge tone={role === "admin" ? "brand" : "neutral"}>{role}</Badge>
          <Icon name="chevron-down" />
        </Button>
      }
    >
      <div className="ui-account-menu">
        <p className="ui-account-email">{user.email}</p>
        <Button
          variant="secondary"
          icon="external-link"
          onClick={() => void signOut()}
        >
          Sign out
        </Button>
      </div>
    </Popover>
  );
}
