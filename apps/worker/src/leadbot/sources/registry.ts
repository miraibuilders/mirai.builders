import type { SourceAdapter, SourceName, SourceRepository } from "./types.js";

const ALLOWED_TYPES = new Set(["api", "published_file", "manual_csv"]);

export class SourceRegistry {
  private readonly adapters = new Map<SourceName, SourceAdapter>();

  constructor(private readonly repository: SourceRepository) {}

  registerAdapter(adapter: SourceAdapter): void {
    if ((adapter.type as string) === "html") {
      throw new Error("HTML_ADAPTER_REJECTED");
    }
    if (!ALLOWED_TYPES.has(adapter.type)) {
      throw new Error("ADAPTER_TYPE_REJECTED");
    }
    if (this.adapters.has(adapter.source)) {
      throw new Error("DUPLICATE_ADAPTER");
    }
    this.adapters.set(adapter.source, adapter);
  }

  getAdapter(source: SourceName): SourceAdapter | undefined {
    return this.adapters.get(source);
  }

  listAdapters(): SourceAdapter[] {
    return [...this.adapters.values()];
  }

  async enableSource(source: SourceName, termsSnapshotId: string): Promise<void> {
    if (!termsSnapshotId) throw new Error("TERMS_SNAPSHOT_REQUIRED");
    if (!(await this.repository.termsSnapshotExists(source, termsSnapshotId))) {
      throw new Error("TERMS_SNAPSHOT_NOT_FOUND");
    }
    await this.repository.enable(source, termsSnapshotId);
  }

  async isEnabled(source: SourceName): Promise<boolean> {
    return this.repository.getEnabled(source);
  }
}
