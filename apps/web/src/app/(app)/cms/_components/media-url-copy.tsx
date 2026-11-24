"use client";

import { Button, Icon, useToast } from "@/ui";

export function MediaUrlCopy({ url, filename }: { url: string; filename: string }) {
  const toast = useToast();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={`Copy URL for ${filename}`}
      onClick={() => {
        if (navigator.clipboard) {
          void navigator.clipboard.writeText(url).catch(() => {
            toast({ tone: "error", title: "Copy failed", description: "URL could not be copied." });
          });
        }
        toast({ tone: "success", title: "URL copied", description: url });
      }}
    >
      <Icon name="link" />
      Copy
    </Button>
  );
}
