import { ButtonLink, EmptyState, PageHeader } from "@/ui";

export default function AppNotFound() {
  return (
    <div className="ui-route-state">
      <PageHeader title="Page not found" description="The internal page you requested does not exist." />
      <EmptyState
        icon="search"
        title="No matching internal page"
        description="Use the navigation or return to the dashboard."
        action={<ButtonLink href="/dashboard">Go to dashboard</ButtonLink>}
      />
    </div>
  );
}
