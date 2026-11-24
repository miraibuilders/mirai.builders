import { PageHeader, Skeleton, SkeletonLines, SkeletonTable } from "@/ui";

export default function AppLoading() {
  return (
    <div className="ui-route-state" aria-busy="true" aria-live="polite">
      <PageHeader title="Loading workspace" description="Preparing your internal view." />
      <div className="ui-route-state-grid">
        <div className="ui-route-state-card">
          <SkeletonLines rows={3} />
        </div>
        <div className="ui-route-state-card">
          <Skeleton height={96} />
          <Skeleton height={8} />
          <Skeleton height={8} width="70%" />
        </div>
      </div>
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}
