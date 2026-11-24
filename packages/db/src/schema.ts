import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "editor", "viewer", "user"]);
export const leadSegmentEnum = pgEnum("lead_segment", [
  "professional_office",
  "clinic",
  "local_business",
  "manufacturer",
  "other",
  "foreign_owned_smb",
  "auto_shop",
  "inbound_tourism",
]);
export const leadStageEnum = pgEnum("lead_stage", [
  "new",
  "contacted",
  "checking",
  "quoted",
  "won",
  "lost",
]);
export const leadReachabilityEnum = pgEnum("lead_reachability", [
  "referral",
  "mika_network",
  "cold_list",
]);
export const leadTemplateEnum = pgEnum("lead_template", ["branded", "mono"]);
export const scanStatusEnum = pgEnum("scan_status", ["queued", "running", "done", "failed"]);
export const scanKindEnum = pgEnum("scan_kind", ["scan", "detail"]);
export const documentTypeEnum = pgEnum("document_type", ["invoice", "quote", "nda", "acceptance"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);
export const documentVariantEnum = pgEnum("document_variant", ["branded", "mono"]);

export const leadWebsiteStatusEnum = pgEnum("lead_website_status", [
  "unknown",
  "none_found_automated",
  "confirmed_none",
  "social_only",
  "dead_domain",
  "has_site",
]);
export const leadReviewStateEnum = pgEnum("lead_review_state", ["auto", "needs_review", "reviewed"]);
export const leadOriginEnum = pgEnum("lead_origin", [
  "nta",
  "gbiz",
  "mhlw",
  "osm",
  "manual_csv",
  "contact_request",
]);
export const leadContactStateEnum = pgEnum("lead_contact_state", [
  "cold",
  "queued_for_call",
  "called",
  "follow_up",
  "do_not_contact",
  "not_interested",
  "won",
]);
export const leadTierEnum = pgEnum("lead_tier", ["A", "B", "C", "Reject"]);
export const sourceNameEnum = pgEnum("source_name", ["nta", "gbiz", "mhlw", "osm", "manual_csv"]);
export const sourceTypeEnum = pgEnum("source_type", ["api", "published_file", "manual_csv"]);
export const sourceCircuitEnum = pgEnum("source_circuit", ["closed", "open", "half_open"]);
export const ingestModeEnum = pgEnum("ingest_mode", ["full", "incremental", "manual"]);
export const dncKindEnum = pgEnum("dnc_kind", ["corporate_number", "domain", "phone", "name_key"]);
export const identityKindEnum = pgEnum("identity_kind", [
  "corporate_number",
  "domain",
  "phone",
  "osm_id",
  "name_key",
  "address_norm",
]);
export const mergeStatusEnum = pgEnum("merge_status", ["pending", "merged", "rejected"]);
export const reviewTaskTypeEnum = pgEnum("review_task_type", [
  "confirm_website",
  "merge",
  "low_confidence",
]);
export const reviewTaskStatusEnum = pgEnum("review_task_status", [
  "pending",
  "assigned",
  "done",
  "skipped",
]);
export const feedbackVerdictEnum = pgEnum("feedback_verdict", [
  "good",
  "bad",
  "wrong_phone",
  "wrong_segment",
  "do_not_contact",
]);

export type ScoreDimensionBreakdown = {
  name: string;
  points: number;
  max: number;
  reasons: string[];
};

export type ScoreCapBreakdown = {
  name: string;
  applied: boolean;
  reason: string;
};

export type ScoreBreakdownV2 = {
  version: string;
  total: number | null;
  tier: "A" | "B" | "C" | "Reject";
  dimensions: ScoreDimensionBreakdown[];
  caps: ScoreCapBreakdown[];
  score_if_confirmed: number | null;
  delta_since_previous: number | null;
  previous_snapshot_id: string | null;
};

export type TaxBreakdownEntry = {
  rate: number;
  subtotal: number;
  tax: number;
};

export type DocumentLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  role: userRoleEnum("role").notNull().default("user"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
});

export const authors = pgTable("authors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  uploadedBy: text("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company: text("company").notNull(),
    // '' means 'no known website'; see website_status for truth
    websiteUrl: text("website_url").notNull(),
    segment: leadSegmentEnum("segment").notNull(),
    score: integer("score").notNull().default(0),
    stage: leadStageEnum("stage").notNull().default("new"),
    painFlags: text("pain_flags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    lastContact: timestamp("last_contact", { withTimezone: true }),
    nextStep: text("next_step"),
    nextStepDate: date("next_step_date"),
    reachability: leadReachabilityEnum("reachability").notNull().default("cold_list"),
    sizeProxy: integer("size_proxy").notNull().default(0),
    preferredTemplate: leadTemplateEnum("preferred_template").default("branded"),
    latestScanAt: timestamp("latest_scan_at", { withTimezone: true }),
    latestScanStatus: scanStatusEnum("latest_scan_status"),
    detailBriefMd: text("detail_brief_md"),
    corporateNumber: text("corporate_number").unique(),
    websiteStatus: leadWebsiteStatusEnum("website_status").notNull().default("unknown"),
    sourceConfidence: doublePrecision("source_confidence").notNull().default(0),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    reviewState: leadReviewStateEnum("review_state").notNull().default("auto"),
    origin: leadOriginEnum("origin").notNull().default("manual_csv"),
    dncBlocked: boolean("dnc_blocked").notNull().default(false),
    legacySystemStated: boolean("legacy_system_stated").notNull().default(false),
    painStated: boolean("pain_stated").notNull().default(false),
    contactState: leadContactStateEnum("contact_state").notNull().default("cold"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      "leads_corporate_number_format_check",
      sql`${table.corporateNumber} IS NULL OR ${table.corporateNumber} ~ '^[0-9]{13}$'`,
    ),
    check(
      "leads_source_confidence_range_check",
      sql`${table.sourceConfidence} >= 0 AND ${table.sourceConfidence} <= 1`,
    ),
  ],
);

export const scans = pgTable("scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  kind: scanKindEnum("kind").notNull().default("scan"),
  status: scanStatusEnum("status").notNull().default("queued"),
  resultJson: jsonb("result_json").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("scans_status_created_at_idx").on(table.status, table.createdAt),
  index("scans_kind_created_at_idx").on(table.kind, table.createdAt),
]);

export const leadActivities = pgTable("lead_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  nextStep: text("next_step"),
  nextStepDate: date("next_step_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: documentTypeEnum("type").notNull(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  partnerName: text("partner_name").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date"),
  issuerName: text("issuer_name"),
  invoiceNumber: text("invoice_number"),
  transactionDate: date("transaction_date"),
  taxBreakdown: jsonb("tax_breakdown").$type<TaxBreakdownEntry[]>().notNull(),
  registrationNumber: text("registration_number"),
  lineItems: jsonb("line_items").$type<DocumentLineItem[]>().notNull(),
  templateVariant: documentVariantEnum("template_variant").notNull().default("branded"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  bodyMd: text("body_md").notNull(),
  authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
  status: postStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoFields: jsonb("seo_fields").$type<Record<string, unknown>>(),
  faqJsonLd: jsonb("faq_json_ld").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const contactRequests = pgTable("contact_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable(
  "site_settings",
  {
    id: integer("id").primaryKey().default(1),
    phone: text("phone"),
    emailJa: text("email_ja"),
    emailEn: text("email_en"),
    addressJa: text("address_ja"),
    addressEn: text("address_en"),
    heroHeadlineJa: text("hero_headline_ja"),
    heroHeadlineEn: text("hero_headline_en"),
    heroSubheadlineJa: text("hero_subheadline_ja"),
    heroSubheadlineEn: text("hero_subheadline_en"),
    heroCtaJa: text("hero_cta_ja"),
    heroCtaEn: text("hero_cta_en"),
    heroImageUrl: text("hero_image_url"),
    heroImageWidth: integer("hero_image_width"),
    heroImageHeight: integer("hero_image_height"),
    heroImageAltJa: text("hero_image_alt_ja"),
    offerNameJa: text("offer_name_ja"),
    offerNameEn: text("offer_name_en"),
    offerDescriptionJa: text("offer_description_ja"),
    offerDescriptionEn: text("offer_description_en"),
    offerPrice: integer("offer_price"),
    aboutAuthorNameJa: text("about_author_name_ja"),
    aboutAuthorNameEn: text("about_author_name_en"),
    aboutAuthorBioJa: text("about_author_bio_ja"),
    aboutAuthorBioEn: text("about_author_bio_en"),
    aboutAuthorImageUrl: text("about_author_image_url"),
    aboutAuthorImageWidth: integer("about_author_image_width"),
    aboutAuthorImageHeight: integer("about_author_image_height"),
    footerCopyrightJa: text("footer_copyright_ja"),
    footerCopyrightEn: text("footer_copyright_en"),
    updatedAt: timestamp("updated_at").defaultNow(),
    updatedBy: text("updated_by").references(() => users.id),
  },
  (table) => [check("site_settings_id_check", sql`${table.id} = 1`)],
);

export const pricingTiers = pgTable("pricing_tiers", {
  id: uuid("id").primaryKey(),
  nameJa: text("name_ja"),
  nameEn: text("name_en"),
  price: text("price"),
  noteJa: text("note_ja"),
  noteEn: text("note_en"),
  sortOrder: integer("sort_order"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const caseStudies = pgTable(
  "case_studies",
  {
    id: uuid("id").primaryKey(),
    status: text("status").default("draft"),
    metaJa: text("meta_ja"),
    metaEn: text("meta_en"),
    titleJa: text("title_ja"),
    titleEn: text("title_en"),
    summaryJa: text("summary_ja"),
    summaryEn: text("summary_en"),
    imageUrl: text("image_url"),
    imageWidth: integer("image_width"),
    imageHeight: integer("image_height"),
    sortOrder: integer("sort_order"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [check("case_studies_status_check", sql`${table.status} IN ('draft', 'published')`)]
);

export const termsSnapshots = pgTable(
  "terms_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: sourceNameEnum("source").notNull(),
    url: text("url").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    excerpt: text("excerpt").notNull(),
    decision: text("decision").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("terms_snapshots_url_check", sql`length(${table.url}) > 0`),
    check("terms_snapshots_decision_check", sql`${table.decision} IN ('allowed', 'blocked', 'review')`),
  ],
);

export const sourceState = pgTable(
  "source_state",
  {
    source: sourceNameEnum("source").primaryKey(),
    enabled: boolean("enabled").notNull().default(false),
    termsSnapshotId: uuid("terms_snapshot_id").references(() => termsSnapshots.id, {
      onDelete: "restrict",
    }),
    circuit: sourceCircuitEnum("circuit").notNull().default("closed"),
    cooldownUntil: timestamp("cooldown_until", { withTimezone: true }),
    backoffLevel: integer("backoff_level").notNull().default(0),
    lastCursor: text("last_cursor"),
    lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
  },
  (table) => [
    check(
      "source_state_terms_snapshot_check",
      sql`${table.enabled} = false OR ${table.termsSnapshotId} IS NOT NULL`,
    ),
  ],
);

export const ingestRuns = pgTable("ingest_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: sourceNameEnum("source").notNull(),
  mode: ingestModeEnum("mode").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  rowsSeen: integer("rows_seen").notNull().default(0),
  rowsNew: integer("rows_new").notNull().default(0),
  rowsMerged: integer("rows_merged").notNull().default(0),
  rowsRejected: integer("rows_rejected").notNull().default(0),
  rowsBlocked: integer("rows_blocked").notNull().default(0),
  http429: integer("http_429").notNull().default(0),
  http5xx: integer("http_5xx").notNull().default(0),
  errorSummary: text("error_summary"),
});

export const sourceRecords = pgTable(
  "source_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: sourceNameEnum("source").notNull(),
    sourceKey: text("source_key").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    sourceUrl: text("source_url").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    licence: text("licence").notNull(),
    termsSnapshotId: uuid("terms_snapshot_id")
      .notNull()
      .references(() => termsSnapshots.id, { onDelete: "restrict" }),
    ingestRunId: uuid("ingest_run_id")
      .notNull()
      .references(() => ingestRuns.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("source_records_source_key_check", sql`length(${table.sourceKey}) > 0`),
    check("source_records_source_url_check", sql`length(${table.sourceUrl}) > 0`),
    check("source_records_licence_check", sql`length(${table.licence}) > 0`),
    index("source_records_lookup_idx").on(table.source, table.sourceKey, table.fetchedAt),
  ],
);

export const leadFields = pgTable(
  "lead_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    field: text("field").notNull(),
    value: text("value").notNull(),
    sourceRecordId: uuid("source_record_id").references(() => sourceRecords.id, {
      onDelete: "set null",
    }),
    source: text("source").notNull(),
    sourceUrl: text("source_url").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    confidence: doublePrecision("confidence").notNull(),
    isWinner: boolean("is_winner").notNull().default(false),
    verifiedBy: text("verified_by").references(() => users.id, { onDelete: "set null" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
  },
  (table) => [
    check("lead_fields_source_check", sql`length(${table.source}) > 0`),
    check("lead_fields_source_url_check", sql`length(${table.sourceUrl}) > 0`),
    check(
      "lead_fields_confidence_check",
      sql`${table.confidence} >= 0 AND ${table.confidence} <= 1`,
    ),
    index("lead_fields_lead_field_idx").on(table.leadId, table.field),
  ],
);

export const leadIdentities = pgTable(
  "lead_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    kind: identityKindEnum("kind").notNull(),
    valueNorm: text("value_norm").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("lead_identities_strong_key_idx")
      .on(table.kind, table.valueNorm)
      .where(sql`${table.kind} IN ('corporate_number', 'domain')`),
    index("lead_identities_lead_idx").on(table.leadId),
  ],
);

export const mergeCandidates = pgTable(
  "merge_candidates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aLead: uuid("a_lead")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    bLead: uuid("b_lead")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    confidence: doublePrecision("confidence").notNull(),
    reasons: jsonb("reasons").$type<Record<string, unknown>>().notNull(),
    status: mergeStatusEnum("status").notNull().default("pending"),
    decidedBy: text("decided_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("merge_candidates_distinct_leads_check", sql`${table.aLead} <> ${table.bLead}`),
    index("merge_candidates_status_idx").on(table.status),
  ],
);

export const mergeLog = pgTable("merge_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  mergeCandidateId: uuid("merge_candidate_id").references(() => mergeCandidates.id, {
    onDelete: "cascade",
  }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  action: text("action").notNull(),
  actor: text("actor"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const doNotContact = pgTable(
  "do_not_contact",
  {
    kind: dncKindEnum("kind").notNull(),
    valueNorm: text("value_norm").notNull(),
    reason: text("reason").notNull(),
    origin: text("origin").notNull(),
    addedBy: text("added_by").references(() => users.id, { onDelete: "set null" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.kind, table.valueNorm] }),
    check("do_not_contact_reason_check", sql`length(${table.reason}) > 0`),
    check(
      "do_not_contact_origin_check",
      sql`${table.origin} IN ('request', 'bounce', 'manual', 'bad_lead')`,
    ),
  ],
);

export const erasureTombstones = pgTable("erasure_tombstones", {
  digest: text("digest").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scoreSnapshots = pgTable(
  "score_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    configVersion: text("config_version").notNull(),
    total: doublePrecision("total"),
    tier: leadTierEnum("tier").notNull(),
    breakdown: jsonb("breakdown").$type<ScoreBreakdownV2>().notNull(),
    scoreIfConfirmed: doublePrecision("score_if_confirmed"),
    inputsHash: text("inputs_hash").notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("score_snapshots_lead_computed_idx").on(table.leadId, table.computedAt)],
);

export const leadFeedback = pgTable("lead_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  verdict: feedbackVerdictEnum("verdict").notNull(),
  reasonCode: text("reason_code"),
  note: text("note"),
  scoreSnapshotId: uuid("score_snapshot_id").references(() => scoreSnapshots.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviewTasks = pgTable("review_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: reviewTaskTypeEnum("type").notNull(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  priority: integer("priority").notNull().default(0),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
  status: reviewTaskStatusEnum("status").notNull().default("pending"),
  assignedTo: text("assigned_to").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const importBatches = pgTable(
  "import_batches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    filename: text("filename").notNull(),
    uploadedBy: text("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    permissionNote: text("permission_note").notNull(),
    columnMap: jsonb("column_map").$type<Record<string, string>>().notNull(),
    rowsSeen: integer("rows_seen").notNull().default(0),
    rowsNew: integer("rows_new").notNull().default(0),
    rowsRejected: integer("rows_rejected").notNull().default(0),
    rowsBlocked: integer("rows_blocked").notNull().default(0),
    encoding: text("encoding").notNull().default("utf-8"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("import_batches_permission_note_check", sql`length(${table.permissionNote}) > 0`)],
);

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actor: text("actor"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  detail: jsonb("detail").$type<Record<string, unknown>>().notNull().default(sql`'{}'::jsonb`),
});

export const leadsRelations = relations(leads, ({ many }) => ({
  scans: many(scans),
  activities: many(leadActivities),
  documents: many(documents),
  contactRequests: many(contactRequests),
  fields: many(leadFields),
  identities: many(leadIdentities),
  scoreSnapshots: many(scoreSnapshots),
  feedback: many(leadFeedback),
  reviewTasks: many(reviewTasks),
}));

export const leadActivitiesRelations = relations(leadActivities, ({ one }) => ({
  lead: one(leads, { fields: [leadActivities.leadId], references: [leads.id] }),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  lead: one(leads, { fields: [scans.leadId], references: [leads.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  lead: one(leads, { fields: [documents.leadId], references: [leads.id] }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  posts: many(posts),
  authors: many(authors),
  media: many(media),
}));

export const authorsRelations = relations(authors, ({ one }) => ({
  user: one(users, { fields: [authors.userId], references: [users.id] }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, { fields: [media.uploadedBy], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const contactRequestsRelations = relations(contactRequests, ({ one }) => ({
  lead: one(leads, { fields: [contactRequests.leadId], references: [leads.id] }),
}));

export const leadFieldsRelations = relations(leadFields, ({ one }) => ({
  lead: one(leads, { fields: [leadFields.leadId], references: [leads.id] }),
  sourceRecord: one(sourceRecords, {
    fields: [leadFields.sourceRecordId],
    references: [sourceRecords.id],
  }),
}));

export const leadIdentitiesRelations = relations(leadIdentities, ({ one }) => ({
  lead: one(leads, { fields: [leadIdentities.leadId], references: [leads.id] }),
}));

export const scoreSnapshotsRelations = relations(scoreSnapshots, ({ one }) => ({
  lead: one(leads, { fields: [scoreSnapshots.leadId], references: [leads.id] }),
}));

export const leadFeedbackRelations = relations(leadFeedback, ({ one }) => ({
  lead: one(leads, { fields: [leadFeedback.leadId], references: [leads.id] }),
}));

export const reviewTasksRelations = relations(reviewTasks, ({ one }) => ({
  lead: one(leads, { fields: [reviewTasks.leadId], references: [leads.id] }),
}));
