export type SourceName = "nta" | "gbiz" | "mhlw" | "osm" | "manual_csv";

export type SourceAdapterType = "api" | "published_file" | "manual_csv";

export type SourceAdapter = {
  source: SourceName;
  type: SourceAdapterType;
  label: string;
};

export type SourceRepository = {
  termsSnapshotExists(source: SourceName, termsSnapshotId: string): Promise<boolean>;
  enable(source: SourceName, termsSnapshotId: string): Promise<void>;
  getEnabled(source: SourceName): Promise<boolean>;
};
