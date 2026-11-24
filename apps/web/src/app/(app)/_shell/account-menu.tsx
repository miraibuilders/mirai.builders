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
          className="ui-account-trigger"
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
        <div className="ui-account-popover-head">
          <Avatar name={user.name} size="md" />
          <span className="ui-account-meta">
            <span className="ui-account-name">{user.name}</span>
            <span className="ui-account-email">{user.email}</span>
          </span>
        </div>
        <div className="ui-account-popover-body">
          <div className="ui-account-popover-role">
            <Badge tone={role === "admin" ? "brand" : "neutral"}>{role}</Badge>
          </div>
          <Button
            variant="secondary"
            icon="external-link"
            onClick={() => void signOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    </Popover>
  );
}
