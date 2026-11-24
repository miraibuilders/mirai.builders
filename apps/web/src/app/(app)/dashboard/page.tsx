import { ButtonLink, PageHeader, SectionHeader } from "@/ui";

export default function DashboardPage() {
  return (
    <div className="container">
      <PageHeader
        title="Dashboard"
        description="Internal entry point for CRM and content workflows."
      />
      <SectionHeader title="Workspaces" description="Open a workspace to continue." />
      <div className="cms-nav" aria-label="Workspaces">
        <ButtonLink href="/leads">Leads</ButtonLink>
        <ButtonLink href="/cms" variant="secondary">CMS</ButtonLink>
      </div>
    </div>
  );
}
