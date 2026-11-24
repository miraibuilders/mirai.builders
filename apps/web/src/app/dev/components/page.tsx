"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  ConfirmationDialog,
  Drawer,
  EmptyState,
  ErrorSummary,
  FormField,
  Icon,
  InlineBanner,
  Input,
  Modal,
  PageHeader,
  Popover,
  Select,
  Skeleton,
  SkeletonLines,
  SkeletonTable,
  Textarea,
  Tooltip,
  useToast,
  spacing,
  fontSizes,
  motion,
  zIndex,
} from "@/ui";

import "../dev.css";

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ui-demo-cell">
      <span className="ui-demo-cell-label">{label}</span>
      {children}
    </div>
  );
}

export default function ComponentsPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <main className="ui-demo-page dev-components" data-hydrated={hydrated ? "true" : undefined}>
      <PageHeader
        title="Component review"
        description="Visual and keyboard review surface for Stage 1 primitives. No product screen consumes these yet."
        actions={
          <>
            <ButtonLink href="/dev/data-table" variant="secondary">Data table</ButtonLink>
            <ButtonLink href="/dev/kanban" variant="secondary">Kanban</ButtonLink>
          </>
        }
      />

      <section className="ui-demo-section" data-demo-section="tokens">
        <h2>Tokens</h2>
        <div className="ui-demo-grid">
          <Cell label="Spacing 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64">
            <div className="ui-demo-inline">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                <span key={step} style={{ width: spacing[step as 1], height: spacing[step as 1], background: "var(--ui-color-primary)" }} />
              ))}
            </div>
          </Cell>
          <Cell label="Type scale">
            <div className="ui-demo-inline">
              {[12, 14, 16, 18, 20, 24, 32].map((size) => (
                <span key={size} style={{ fontSize: fontSizes[size as 12] }}>{size}</span>
              ))}
            </div>
          </Cell>
          <Cell label="Motion / stacking">
            <span>Micro {motion.micro}, page {motion.page}, palette z {zIndex.palette}</span>
          </Cell>
        </div>
      </section>

      <section className="ui-demo-section" data-demo-section="button">
        <h2>Button</h2>
        <div className="ui-demo-grid">
          {(["primary", "secondary", "ghost", "destructive"] as const).map((variant) => (
            <Cell key={variant} label={variant}>
              <div className="ui-demo-inline">
                <Button variant={variant}>Default</Button>
                <Button variant={variant} demoState="hover">Hover</Button>
                <Button variant={variant} demoState="focus">Focus</Button>
                <Button variant={variant} disabled>Disabled</Button>
                <Button variant={variant} loading>Loading</Button>
              </div>
            </Cell>
          ))}
          <Cell label="sizes / icon-only / link">
            <div className="ui-demo-inline">
              <Button size="sm">Small</Button>
              <Button iconOnly icon="plus" aria-label="Add item" />
              <ButtonLink href="/dev/components" variant="secondary">Link button</ButtonLink>
            </div>
          </Cell>
        </div>
      </section>

      <section className="ui-demo-section" data-demo-section="inputs">
        <h2>Input, textarea, select</h2>
        <div className="ui-demo-grid">
          <Cell label="input states">
            <Input aria-label="Input default" placeholder="Default" />
            <Input aria-label="Input hover" placeholder="Hover" demoState="hover" />
            <Input aria-label="Input focus" placeholder="Focus" demoState="focus" />
            <Input aria-label="Input disabled" placeholder="Disabled" disabled />
            <Input aria-label="Input error" placeholder="Error" aria-invalid="true" aria-describedby="demo-input-error" />
            <span id="demo-input-error" className="ui-field-error">Enter a valid value.</span>
            <Input aria-label="Input loading" placeholder="Loading" aria-busy="true" readOnly value="Saving…" />
          </Cell>
          <Cell label="textarea states">
            <Textarea aria-label="Textarea default" placeholder="Default" />
            <Textarea aria-label="Textarea hover" placeholder="Hover" demoState="hover" />
            <Textarea aria-label="Textarea focus" placeholder="Focus" demoState="focus" />
            <Textarea aria-label="Textarea disabled" placeholder="Disabled" disabled />
            <Textarea aria-label="Textarea error" aria-invalid="true" placeholder="Error" />
          </Cell>
          <Cell label="select states">
            <Select aria-label="Select default" defaultValue="one"><option value="one">Default</option></Select>
            <Select aria-label="Select hover" demoState="hover"><option>Hover</option></Select>
            <Select aria-label="Select focus" demoState="focus"><option>Focus</option></Select>
            <Select aria-label="Select disabled" disabled><option>Disabled</option></Select>
            <Select aria-label="Select error" aria-invalid="true"><option>Error</option></Select>
          </Cell>
        </div>
      </section>

      <section className="ui-demo-section" data-demo-section="form-field">
        <h2>Form field and validation</h2>
        <div className="ui-demo-grid">
          <Cell label="required with help">
            <FormField label="Company name" required help="Registered company name.">
              {({ id, describedBy, invalid }) => (
                <Input id={id} name="company" aria-describedby={describedBy} aria-invalid={invalid} />
              )}
            </FormField>
          </Cell>
          <Cell label="optional with error">
            <FormField label="Website" error="Enter a full URL including https://.">
              {({ id, describedBy, invalid }) => (
                <Input id={id} name="website" aria-describedby={describedBy} aria-invalid={invalid} />
              )}
            </FormField>
          </Cell>
          <Cell label="hover / focus / disabled / loading">
            <Input aria-label="Field hover" demoState="hover" />
            <Input aria-label="Field focus" demoState="focus" />
            <Input aria-label="Field disabled" disabled />
            <SkeletonLines rows={2} />
          </Cell>
        </div>
        <ErrorSummary errors={[{ id: "ui-field-company", message: "Company name is required." }, { id: "ui-field-website", message: "Website must be a full URL." }]} />
      </section>

      <section className="ui-demo-section" data-demo-section="badge-avatar">
        <h2>Badge and avatar</h2>
        <div className="ui-demo-grid">
          <Cell label="badge tones">
            <div className="ui-demo-inline">
              <Badge>Neutral</Badge>
              <Badge tone="brand" icon="star">Brand</Badge>
              <Badge tone="success" icon="check-circle">Published</Badge>
              <Badge tone="warning" icon="alert-triangle">Draft</Badge>
              <Badge tone="danger" icon="alert-circle">Overdue</Badge>
              <Badge tone="info" icon="info">Info</Badge>
            </div>
          </Cell>
          <Cell label="avatar">
            <div className="ui-demo-inline">
              <Avatar name="Mika Sato" size="sm" />
              <Avatar name="Mika Sato" />
              <Avatar name="Mika Sato" size="lg" />
              <Avatar name="Mika Sato" src="/mika-placeholder.svg" />
              <Avatar name="一郎 田中" />
            </div>
          </Cell>
        </div>
      </section>

      <section className="ui-demo-section" data-demo-section="tooltip">
        <h2>Tooltip</h2>
        <div className="ui-demo-grid">
          <Cell label="hover / focus">
            <Tooltip content="Shows on hover and keyboard focus.">
              <Button variant="secondary">Hover or focus me</Button>
            </Tooltip>
            <Tooltip content="Forced hover." demoState="hover">
              <Button variant="secondary">Forced hover</Button>
            </Tooltip>
          </Cell>
        </div>
      </section>

      <section className="ui-demo-section" data-demo-section="skeleton">
        <h2>Skeleton and empty state</h2>
        <div className="ui-demo-grid">
          <Cell label="skeleton lines"><SkeletonLines rows={4} /></Cell>
          <Cell label="skeleton table"><SkeletonTable rows={4} columns={3} /></Cell>
          <Cell label="skeleton shapes">
            <Skeleton width={48} height={48} circle />
            <Skeleton width="80%" height={24} />
          </Cell>
        </div>
        <EmptyState
          icon="inbox"
          title="Nothing here yet"
          description="New items will appear here once they are created."
          action={<Button>Create first item</Button>}
          secondary={<ButtonLink href="/dev/components" variant="ghost">Learn more</ButtonLink>}
        />
      </section>

      <section className="ui-demo-section" data-demo-section="banner">
        <h2>Inline banner</h2>
        <div className="ui-demo-grid">
          <Cell label="info"><InlineBanner title="Heads up">Saved settings affect the public site.</InlineBanner></Cell>
          <Cell label="success"><InlineBanner tone="success" title="Saved">Your changes are live.</InlineBanner></Cell>
          <Cell label="warning"><InlineBanner tone="warning" title="Check required">One field still needs attention.</InlineBanner></Cell>
          <Cell label="error / alert"><InlineBanner tone="danger" title="Could not save">Website is required.</InlineBanner></Cell>
        </div>
      </section>

      <section className="ui-demo-section" data-demo-section="toast">
        <h2>Toast</h2>
        <div className="ui-demo-inline">
          <Button onClick={() => toast({ tone: "success", title: "Saved", description: "Changes were saved." })}>Show success toast</Button>
          <Button variant="secondary" onClick={() => toast({ tone: "error", title: "Failed", description: "Website is required." })}>Show error toast</Button>
          <Button variant="secondary" onClick={() => toast({ tone: "info", title: "Info", description: "Review queue is ready." })}>Show info toast</Button>
          <Button variant="ghost" onClick={() => toast({ tone: "success", title: "Deleted", actionLabel: "Undo", onAction: () => setConfirmed(false) })}>Show undo toast</Button>
        </div>
      </section>

      <section className="ui-demo-section" data-demo-section="dialog">
        <h2>Modal, drawer, popover, confirmation</h2>
        <div className="ui-demo-inline">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>Open confirmation</Button>
          <Popover
            open={popoverOpen}
            onClose={() => setPopoverOpen(false)}
            label="Move to stage"
            trigger={<Button variant="secondary" onClick={() => setPopoverOpen((value) => !value)}>Open popover</Button>}
          >
            <Button variant="ghost" onClick={() => setPopoverOpen(false)}>Checking</Button>
            <Button variant="ghost" onClick={() => setPopoverOpen(false)}>Quoted</Button>
          </Popover>
        </div>
        <p aria-live="polite">Confirmation result: {confirmed ? "confirmed" : "not confirmed"}</p>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal title"
        description="Escape closes this dialog and returns focus to the trigger."
        footer={<Button onClick={() => setModalOpen(false)}>Done</Button>}
      >
        <FormField label="Company name" required>
          {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} />}
        </FormField>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Drawer title"
        description="The same dialog primitive with drawer placement."
        footer={<Button onClick={() => setDrawerOpen(false)}>Close drawer</Button>}
      >
        <p>Drawer content</p>
      </Drawer>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this item?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          setConfirmed(true);
          setConfirmOpen(false);
        }}
      />

      <section className="ui-demo-section">
        <h2>Icon set</h2>
        <div className="ui-demo-inline">
          <Icon name="search" size={20} />
          <Icon name="check-circle" size={20} />
          <Icon name="alert-triangle" size={20} />
          <Icon name="file" size={20} />
          <Icon name="user" size={20} />
          <Icon name="menu" size={20} />
        </div>
      </section>
    </main>
  );
}
