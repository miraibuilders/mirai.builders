"use client";

import { Button, InlineBanner, PageHeader } from "@/ui";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="ui-route-state" role="alert">
      <PageHeader
        title="Something went wrong"
        description="This view could not be loaded. Your session and saved data are unaffected."
      />
      <InlineBanner tone="danger" title="View error">
        {error.message || "An unexpected error occurred."}
      </InlineBanner>
      <div className="ui-route-state-actions">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
