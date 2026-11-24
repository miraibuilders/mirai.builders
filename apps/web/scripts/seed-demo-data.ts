import { randomUUID } from "node:crypto";
import { getDb } from "@mirai/db";
import {
  authors,
  caseStudies,
  contactRequests,
  doNotContact,
  documents,
  leadActivities,
  leads,
  media,
  posts,
  pricingTiers,
  scans,
  siteSettings,
  users,
} from "@mirai/db/schema";
import { eq, sql } from "drizzle-orm";

const now = () => new Date();
const daysFromNow = (days: number) => {
  const value = now();
  value.setDate(value.getDate() + days);
  return value;
};
const dateFromNow = (days: number) => daysFromNow(days).toISOString().slice(0, 10);
const corporateNumber = (index: number) => String(9000000000000 + index);
const tierForScore = (score: number): "A" | "B" | "C" | "Reject" =>
  score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "Reject";

const leadSeeds = [
  {
    company: "株式会社みらい工務店",
    websiteUrl: "https://mirai-koumuten.example.jp",
    segment: "local_business",
    score: 84,
    stage: "checking",
    painFlags: ["outdated_design", "no_online_booking", "slow_mobile"],
    nextStep: "Send renovation package",
    nextStepDate: dateFromNow(-3),
    reachability: "referral",
    sizeProxy: 12,
    preferredTemplate: "branded",
    scanStatus: "done",
    detailBriefMd: "Older template, no clear service areas, and the contact form is three layers deep. Good fit for a focused local renovation package.",
    websiteStatus: "has_site",
    sourceConfidence: 0.92,
    reviewState: "auto",
    origin: "nta",
    contactState: "called",
    legacySystemStated: true,
    painStated: true,
    note: "Introduced by an existing client. They want more renovation enquiries from the northern ward.",
  },
  {
    company: "青葉歯科クリニック",
    websiteUrl: "https://aoba-dental.example.jp",
    segment: "clinic",
    score: 78,
    stage: "quoted",
    painFlags: ["weak_local_seo", "no_booking_link"],
    nextStep: "Follow up on quote",
    nextStepDate: dateFromNow(2),
    reachability: "mika_network",
    sizeProxy: 8,
    preferredTemplate: "branded",
    scanStatus: "done",
    detailBriefMd: "Practice information is current but reservations require a phone call. Map listing and hours are inconsistent.",
    websiteStatus: "has_site",
    sourceConfidence: 0.86,
    reviewState: "auto",
    origin: "mhlw",
    contactState: "follow_up",
    legacySystemStated: false,
    painStated: true,
    note: "Office manager asked for a quote after the clinic moved to the new building.",
  },
  {
    company: "株式会社北陸精密製作所",
    websiteUrl: "https://hokuriku-seimitsu.example.jp",
    segment: "manufacturer",
    score: 91,
    stage: "new",
    painFlags: ["no_website", "legacy_directory_listing", "outdated_phone"],
    nextStep: "Confirm website status",
    nextStepDate: dateFromNow(-1),
    reachability: "cold_list",
    sizeProxy: 34,
    preferredTemplate: "mono",
    scanStatus: "failed",
    detailBriefMd: "Directory record suggests no active site. Need a manual check before outreach because the phone number may be stale.",
    websiteStatus: "none_found_automated",
    sourceConfidence: 0.61,
    reviewState: "needs_review",
    origin: "nta",
    contactState: "cold",
    legacySystemStated: true,
    painStated: false,
    note: "Found in the manufacturing registry with an incomplete public profile.",
  },
  {
    company: "丸藤自動車整備",
    websiteUrl: "https://marufuji-auto.example.jp",
    segment: "auto_shop",
    score: 66,
    stage: "contacted",
    painFlags: ["slow_mobile"],
    nextStep: "Call back after inspection",
    nextStepDate: dateFromNow(5),
    reachability: "cold_list",
    sizeProxy: 6,
    preferredTemplate: "branded",
    scanStatus: "done",
    detailBriefMd: "Mobile page is slow and inspection menu is hard to scan. Existing customers seem to arrive mostly by word of mouth.",
    websiteStatus: "has_site",
    sourceConfidence: 0.74,
    reviewState: "auto",
    origin: "gbiz",
    contactState: "called",
    legacySystemStated: false,
    painStated: true,
    note: "Spoke with the owner about seasonal inspection demand.",
  },
  {
    company: "合同会社シーサイド翻訳",
    websiteUrl: "https://seaside-translation.example.jp",
    segment: "foreign_owned_smb",
    score: 88,
    stage: "won",
    painFlags: ["outdated_design", "weak_local_seo"],
    nextStep: "Kickoff materials sent",
    nextStepDate: null,
    reachability: "referral",
    sizeProxy: 5,
    preferredTemplate: "branded",
    scanStatus: "done",
    detailBriefMd: "Bilingual service pages are thin and the portfolio has not been updated in two years.",
    websiteStatus: "has_site",
    sourceConfidence: 0.89,
    reviewState: "reviewed",
    origin: "manual_csv",
    contactState: "won",
    legacySystemStated: false,
    painStated: true,
    note: "Signed after the second proposal. Work begins next week.",
  },
  {
    company: "ホテル小倉橋",
    websiteUrl: "https://hotel-ogurabashi.example.jp",
    segment: "inbound_tourism",
    score: 73,
    stage: "checking",
    painFlags: ["no_booking_link", "thin_english_pages", "slow_mobile"],
    nextStep: "Review competitor set",
    nextStepDate: dateFromNow(-6),
    reachability: "mika_network",
    sizeProxy: 18,
    preferredTemplate: "branded",
    scanStatus: "done",
    detailBriefMd: "English pages are thin and reservation buttons are not visible above the fold on mobile.",
    websiteStatus: "has_site",
    sourceConfidence: 0.83,
    reviewState: "needs_review",
    origin: "osm",
    contactState: "queued_for_call",
    legacySystemStated: false,
    painStated: true,
    note: "A travel agent asked whether the property is ready for inbound demand this autumn.",
  },
  {
    company: "さくら法務事務所",
    websiteUrl: "https://sakura-legal.example.jp",
    segment: "professional_office",
    score: 82,
    stage: "new",
    painFlags: ["outdated_design"],
    nextStep: "Send introductory email",
    nextStepDate: dateFromNow(1),
    reachability: "referral",
    sizeProxy: 4,
    preferredTemplate: "mono",
    scanStatus: "done",
    detailBriefMd: "Site is clean but dated; practice areas need clearer grouping and a stronger contact path.",
    websiteStatus: "has_site",
    sourceConfidence: 0.8,
    reviewState: "auto",
    origin: "manual_csv",
    contactState: "cold",
    legacySystemStated: false,
    painStated: false,
    note: "Referred by a client who handles their accounting.",
  },
  {
    company: "有限会社陽光建材",
    websiteUrl: "https://youko-building.example.jp",
    segment: "manufacturer",
    score: 44,
    stage: "lost",
    painFlags: [],
    nextStep: null,
    nextStepDate: null,
    reachability: "cold_list",
    sizeProxy: 9,
    preferredTemplate: "mono",
    scanStatus: "done",
    detailBriefMd: "Existing site already covers the main catalogue. No urgent pain identified in this cycle.",
    websiteStatus: "has_site",
    sourceConfidence: 0.7,
    reviewState: "reviewed",
    origin: "nta",
    contactState: "not_interested",
    legacySystemStated: false,
    painStated: false,
    note: "Declined because they just completed a site refresh in-house.",
  },
  {
    company: "カフェ木漏れ日",
    websiteUrl: "https://cafe-komorebi.example.jp",
    segment: "local_business",
    score: 57,
    stage: "contacted",
    painFlags: ["no_online_booking", "thin_english_pages"],
    nextStep: "Send menu photo request",
    nextStepDate: dateFromNow(-2),
    reachability: "cold_list",
    sizeProxy: 3,
    preferredTemplate: "branded",
    scanStatus: "done",
    detailBriefMd: "Opening hours are visible, but the booking flow is not clear and the English page is mostly empty.",
    websiteStatus: "has_site",
    sourceConfidence: 0.68,
    reviewState: "auto",
    origin: "osm",
    contactState: "called",
    legacySystemStated: false,
    painStated: true,
    note: "Owner asked whether online reservations would be worth the effort.",
  },
  {
    company: "メディカルサポート河西",
    websiteUrl: "https://medical-support-kawai.example.jp",
    segment: "clinic",
    score: 69,
    stage: "new",
    painFlags: ["weak_local_seo"],
    nextStep: "Verify service area",
    nextStepDate: dateFromNow(3),
    reachability: "mika_network",
    sizeProxy: 7,
    preferredTemplate: "branded",
    scanStatus: "queued",
    detailBriefMd: null,
    websiteStatus: "has_site",
    sourceConfidence: 0.77,
    reviewState: "auto",
    origin: "mhlw",
    contactState: "cold",
    legacySystemStated: false,
    painStated: false,
    note: "New home-visit nursing provider added to the clinic list.",
  },
  {
    company: "株式会社東海ロジスティクス",
    websiteUrl: "https://tokai-logistics.example.jp",
    segment: "manufacturer",
    score: 76,
    stage: "quoted",
    painFlags: ["outdated_design", "slow_mobile"],
    nextStep: "Prepare revised quote",
    nextStepDate: dateFromNow(7),
    reachability: "referral",
    sizeProxy: 28,
    preferredTemplate: "mono",
    scanStatus: "done",
    detailBriefMd: "Recruitment pages are the strongest traffic source but the mobile version is difficult to use.",
    websiteStatus: "has_site",
    sourceConfidence: 0.85,
    reviewState: "auto",
    origin: "gbiz",
    contactState: "follow_up",
    legacySystemStated: true,
    painStated: true,
    note: "Asked for a revised scope after adding two more depots.",
  },
  {
    company: "みどり美容室",
    websiteUrl: "",
    segment: "local_business",
    score: 38,
    stage: "new",
    painFlags: ["no_website", "social_only"],
    nextStep: "Confirm social-only presence",
    nextStepDate: dateFromNow(-9),
    reachability: "cold_list",
    sizeProxy: 2,
    preferredTemplate: "branded",
    scanStatus: "failed",
    detailBriefMd: "Only a booking social profile is visible. A simple site may still be useful for local search.",
    websiteStatus: "social_only",
    sourceConfidence: 0.52,
    reviewState: "needs_review",
    origin: "osm",
    contactState: "cold",
    legacySystemStated: false,
    painStated: false,
    note: "Found while checking neighbourhood businesses without sites.",
  },
  {
    company: "株式会社アオゾラIT",
    websiteUrl: "https://aozora-it.example.jp",
    segment: "professional_office",
    score: 87,
    stage: "checking",
    painFlags: ["weak_local_seo", "outdated_design", "no_case_studies"],
    nextStep: "Book discovery call",
    nextStepDate: dateFromNow(4),
    reachability: "referral",
    sizeProxy: 15,
    preferredTemplate: "branded",
    scanStatus: "running",
    detailBriefMd: "Strong service list but no published case studies and little evidence of recent work.",
    websiteStatus: "has_site",
    sourceConfidence: 0.88,
    reviewState: "auto",
    origin: "manual_csv",
    contactState: "queued_for_call",
    legacySystemStated: false,
    painStated: true,
    note: "Partner suggested they need a clearer portfolio before hiring.",
  },
  {
    company: "三浦醸造株式会社",
    websiteUrl: "https://miura-brewing.example.jp",
    segment: "manufacturer",
    score: 63,
    stage: "contacted",
    painFlags: ["thin_english_pages"],
    nextStep: "Send export page outline",
    nextStepDate: dateFromNow(9),
    reachability: "mika_network",
    sizeProxy: 22,
    preferredTemplate: "branded",
    scanStatus: "done",
    detailBriefMd: "Domestic pages are solid; export enquiries need a clearer English route and product lookup.",
    websiteStatus: "has_site",
    sourceConfidence: 0.79,
    reviewState: "auto",
    origin: "nta",
    contactState: "called",
    legacySystemStated: true,
    painStated: true,
    note: "Discussed an English page for overseas distributors.",
  },
] as const;

const leadIds = leadSeeds.map(() => randomUUID());

type ActivitySeed = {
  leadId: string;
  note: string;
  nextStep: string | null;
  nextStepDate: string | null;
  createdAt: Date;
};

const activitySeeds: ActivitySeed[] = leadSeeds.flatMap((lead, index) => {
  const entries: ActivitySeed[] = [
    {
      leadId: leadIds[index],
      note: lead.note,
      nextStep: lead.nextStep,
      nextStepDate: lead.nextStepDate,
      createdAt: daysFromNow(-12 + index),
    },
  ];
  if (index % 2 === 0) {
    entries.push({
      leadId: leadIds[index],
      note: `Checked the public profile again; current status is ${lead.stage}.`,
      nextStep: lead.nextStep,
      nextStepDate: lead.nextStepDate,
      createdAt: daysFromNow(-5 + index),
    });
  }
  return entries;
});

const contactSeeds = [
  {
    name: "佐藤 直人",
    company: "株式会社みらい工務店",
    email: "naoto.sato@example.jp",
    phone: "090-1112-3344",
    message: "リフォームの問い合わせを増やしたいので、まずはサイトの状態を確認してください。",
    leadId: leadIds[0],
  },
  {
    name: "小林 美咲",
    company: "青葉歯科クリニック",
    email: "misaki.kobayashi@example.jp",
    phone: "090-2233-4455",
    message: "予約導線と診察時間の案内を見直したいです。",
    leadId: leadIds[1],
  },
  {
    name: "高橋 健一",
    company: "株式会社北陸精密製作所",
    email: "kenichi.takahashi@example.jp",
    phone: "090-3344-5566",
    message: "古い電話番号が掲載されたままなので、掲載情報を確認してほしいです。",
    leadId: leadIds[2],
  },
  {
    name: "中村 由紀",
    company: "ホテル小倉橋",
    email: "yuki.nakamura@example.jp",
    phone: "090-4455-6677",
    message: "英語ページと予約ボタンを改善したいと考えています。",
    leadId: leadIds[5],
  },
  {
    name: "山本 悠",
    company: "カフェ木漏れ日",
    email: "yu.yamamoto@example.jp",
    phone: "090-5566-7788",
    message: "オンライン予約を導入すべきか相談したいです。",
    leadId: leadIds[8],
  },
  {
    name: "石田 亮",
    company: "三浦醸造株式会社",
    email: "ryo.ishida@example.jp",
    phone: "090-6677-8899",
    message: "海外販売向けの英語ページについて話を聞きたいです。",
    leadId: leadIds[13],
  },
  {
    name: "藤原 沙織",
    company: "新規相談（未登録）",
    email: "saori.fujiwara@example.jp",
    phone: "090-7788-9900",
    message: "制作会社に依頼する前に、必要なページ構成を整理したいです。",
    leadId: null,
  },
] as const;

const documentSeeds = [
  {
    type: "invoice",
    leadId: leadIds[0],
    partnerName: "株式会社みらい工務店",
    issueDate: dateFromNow(-4),
    dueDate: dateFromNow(26),
    issuerName: "MIRAI Lab",
    invoiceNumber: "INV-2026-0142",
    transactionDate: dateFromNow(-6),
    taxBreakdown: [{ rate: 10, subtotal: 280000, tax: 28000 }],
    registrationNumber: "T1234567890123",
    lineItems: [{ description: "Website planning and design", quantity: 1, unitPrice: 280000, taxRate: 10 }],
    templateVariant: "branded",
  },
  {
    type: "quote",
    leadId: leadIds[1],
    partnerName: "青葉歯科クリニック",
    issueDate: dateFromNow(-2),
    dueDate: dateFromNow(28),
    issuerName: "MIRAI Lab",
    invoiceNumber: "QUO-2026-0067",
    transactionDate: null,
    taxBreakdown: [{ rate: 10, subtotal: 360000, tax: 36000 }],
    registrationNumber: "T1234567890123",
    lineItems: [
      { description: "Booking flow redesign", quantity: 1, unitPrice: 220000, taxRate: 10 },
      { description: "Local search clean-up", quantity: 1, unitPrice: 140000, taxRate: 10 },
    ],
    templateVariant: "branded",
  },
  {
    type: "nda",
    leadId: leadIds[2],
    partnerName: "株式会社北陸精密製作所",
    issueDate: dateFromNow(-8),
    dueDate: null,
    issuerName: "MIRAI Lab",
    invoiceNumber: null,
    transactionDate: null,
    taxBreakdown: [],
    registrationNumber: null,
    lineItems: [],
    templateVariant: "mono",
  },
  {
    type: "acceptance",
    leadId: leadIds[4],
    partnerName: "合同会社シーサイド翻訳",
    issueDate: dateFromNow(-14),
    dueDate: null,
    issuerName: "MIRAI Lab",
    invoiceNumber: null,
    transactionDate: dateFromNow(-14),
    taxBreakdown: [],
    registrationNumber: null,
    lineItems: [],
    templateVariant: "branded",
  },
  {
    type: "invoice",
    leadId: leadIds[10],
    partnerName: "株式会社東海ロジスティクス",
    issueDate: dateFromNow(-11),
    dueDate: dateFromNow(19),
    issuerName: "MIRAI Lab",
    invoiceNumber: "INV-2026-0131",
    transactionDate: dateFromNow(-12),
    taxBreakdown: [{ rate: 10, subtotal: 150000, tax: 15000 }],
    registrationNumber: "T1234567890123",
    lineItems: [{ description: "Discovery workshop", quantity: 1, unitPrice: 150000, taxRate: 10 }],
    templateVariant: "mono",
  },
  {
    type: "quote",
    leadId: leadIds[12],
    partnerName: "株式会社アオゾラIT",
    issueDate: dateFromNow(-1),
    dueDate: dateFromNow(29),
    issuerName: "MIRAI Lab",
    invoiceNumber: "QUO-2026-0074",
    transactionDate: null,
    taxBreakdown: [{ rate: 10, subtotal: 420000, tax: 42000 }],
    registrationNumber: "T1234567890123",
    lineItems: [{ description: "Case study content package", quantity: 1, unitPrice: 420000, taxRate: 10 }],
    templateVariant: "branded",
  },
] as const;

const authorSeeds = [
  {
    name: "Mika Sato",
    bio: "Local business web reviewer and editor.",
    photoUrl: "/mika-placeholder.svg",
    userId: null as string | null,
  },
  {
    name: "Kenji Tanaka",
    bio: "Handles technical reviews and document templates.",
    photoUrl: "/mika-placeholder.svg",
    userId: null as string | null,
  },
  {
    name: "Aya Mori",
    bio: "Contributing reviewer for clinic and tourism leads.",
    photoUrl: "/mika-placeholder.svg",
    userId: null as string | null,
  },
];

const postSeeds = [
  {
    title: "Website refresh checklist for local contractors",
    slug: "website-refresh-checklist",
    bodyMd: "# Website refresh checklist\n\nUse this checklist before starting a local business site refresh.\n\n- Confirm contact routes\n- Check mobile speed\n- Review service areas",
    status: "published",
    publishedAt: daysFromNow(-20),
    seoTitle: "Website refresh checklist",
    seoDescription: "A practical review checklist for small local business websites.",
    seoFields: { canonical: "/blog/website-refresh-checklist" },
    faqJsonLd: { "@type": "FAQPage", mainEntity: [] },
  },
  {
    title: "How to review a clinic booking flow",
    slug: "clinic-booking-flow-review",
    bodyMd: "# Clinic booking flow review\n\nCheck whether patients can find hours, location, and reservations without calling.",
    status: "published",
    publishedAt: daysFromNow(-13),
    seoTitle: "Clinic booking flow review",
    seoDescription: "A short review guide for clinic websites.",
    seoFields: { canonical: "/blog/clinic-booking-flow-review" },
    faqJsonLd: { "@type": "FAQPage", mainEntity: [] },
  },
  {
    title: "What to check on a tourism landing page",
    slug: "tourism-landing-page-checks",
    bodyMd: "# Tourism landing page checks\n\nLook for language coverage, booking visibility, and mobile readability.",
    status: "published",
    publishedAt: daysFromNow(-7),
    seoTitle: "Tourism landing page checks",
    seoDescription: "Review points for inbound tourism pages.",
    seoFields: { canonical: "/blog/tourism-landing-page-checks" },
    faqJsonLd: { "@type": "FAQPage", mainEntity: [] },
  },
  {
    title: "Manufacturer site: catalogue and recruitment",
    slug: "manufacturer-site-catalogue",
    bodyMd: "# Manufacturer site review\n\nCatalogue depth and recruitment pages often carry most of the useful traffic.",
    status: "published",
    publishedAt: daysFromNow(-3),
    seoTitle: "Manufacturer site review",
    seoDescription: "Catalogue and recruitment review notes for manufacturers.",
    seoFields: { canonical: "/blog/manufacturer-site-catalogue" },
    faqJsonLd: { "@type": "FAQPage", mainEntity: [] },
  },
  {
    title: "Case study interview questions",
    slug: "case-study-interview-questions",
    bodyMd: "# Case study interview questions\n\nDraft questions for the next round of customer interviews.",
    status: "published",
    publishedAt: daysFromNow(-1),
    seoTitle: "Case study interview questions",
    seoDescription: "Interview prompts for writing useful case studies.",
    seoFields: { canonical: "/blog/case-study-interview-questions" },
    faqJsonLd: { "@type": "FAQPage", mainEntity: [] },
  },
  {
    title: "Internal review rubric draft",
    slug: "internal-review-rubric-draft",
    bodyMd: "# Internal review rubric draft\n\nPending review by Mika before publication.",
    status: "draft",
    publishedAt: null,
    seoTitle: null,
    seoDescription: null,
    seoFields: null,
    faqJsonLd: null,
  },
  {
    title: "Booking button patterns",
    slug: "booking-button-patterns",
    bodyMd: "# Booking button patterns\n\nCollect examples from the current review queue.",
    status: "draft",
    publishedAt: null,
    seoTitle: null,
    seoDescription: null,
    seoFields: null,
    faqJsonLd: null,
  },
] as const;

const mediaSeeds = [
  { filename: "hero-workshop.svg", mime: "image/svg+xml", size: 18240, url: "/mika-placeholder.svg" },
  { filename: "clinic-before-after.svg", mime: "image/svg+xml", size: 14620, url: "/mika-placeholder.svg" },
  { filename: "case-study-thumbnail.svg", mime: "image/svg+xml", size: 12880, url: "/mika-placeholder.svg" },
  { filename: "author-portrait.svg", mime: "image/svg+xml", size: 9310, url: "/mika-placeholder.svg" },
] as const;

const dncSeeds = [
  { kind: "domain", valueNorm: "closed-example.jp", reason: "Business closed confirmed by owner", origin: "request" },
  { kind: "phone", valueNorm: "819055551234", reason: "Number belongs to a different business", origin: "bad_lead" },
  { kind: "corporate_number", valueNorm: "9000000000999", reason: "Duplicate registry entry", origin: "manual" },
  { kind: "name_key", valueNorm: "旧みらい工務店", reason: "Renamed business, old record retired", origin: "manual" },
  { kind: "domain", valueNorm: "spam-invoice.example", reason: "Bounced outreach twice", origin: "bounce" },
] as const;

const siteSettingsValues = (adminId: string) => ({
  id: 1,
  phone: "03-5555-0188",
  emailJa: "contact@mirailab.example.jp",
  emailEn: "contact@mirailab.example.jp",
  addressJa: "東京都中央区日本橋1-2-3 4F",
  addressEn: "1-2-3 Nihonbashi, Chuo-ku, Tokyo",
  heroHeadlineJa: "公開情報から始めて、Webと業務を整える。",
  heroHeadlineEn: "Practical web security and systems, starting with public signals.",
  heroSubheadlineJa:
    "公開情報のみを確認する無料サイト診断から、初めてのホームページ制作、表計算・Access等の業務改善まで一貫してご相談いただけます。",
  heroSubheadlineEn:
    "From non-intrusive website health checks to first-time company websites and modernization of fragile spreadsheets, Access files, and legacy PHP systems.",
  heroCtaJa: "無料相談を申し込む",
  heroCtaEn: "Request a free consultation",
  heroImageUrl: "/brand/hero_tokyo_architecture_1795524957427.jpg",
  heroImageWidth: 1376,
  heroImageHeight: 768,
  heroImageAltJa: "光が差し込む静謐な東京のエンジニアリングオフィス建築空間",
  offerNameJa: "無料サイト診断",
  offerNameEn: "Free Website Health Check",
  offerDescriptionJa:
    "HTTP応答ヘッダ、TLS証明書、DNSメール認証、公開ファイルを外部から確認し、優先対応事項をまとめます。",
  offerDescriptionEn:
    "A passive review of HTTP response headers, TLS certificates, DNS email authentication, and publicly exposed files, with prioritized next steps.",
  offerPrice: 0,
  aboutAuthorNameJa: "ミライラボ 代表",
  aboutAuthorNameEn: "MIRAI Lab",
  aboutAuthorBioJa: "中小企業のWebと業務を、実務に即して整える",
  aboutAuthorBioEn: "Practical web and systems support for growing businesses",
  aboutAuthorImageUrl: "/brand/team_client_lead_1795527162144.jpg",
  aboutAuthorImageWidth: 896,
  aboutAuthorImageHeight: 1200,
  footerCopyrightJa: "MIRAI Lab. All rights reserved.",
  footerCopyrightEn: "MIRAI Lab. All rights reserved.",
  updatedAt: now(),
  updatedBy: adminId,
});

const pricingSeeds = [
  {
    id: randomUUID(),
    nameJa: "ホームページ制作・刷新",
    nameEn: "Website Build & Renewal",
    price: "￥29,800",
    noteJa: "スマートフォン対応とお問い合わせ導線を含む基本プラン",
    noteEn: "Starter plan with responsive pages and a working contact flow",
    sortOrder: 0,
    createdAt: daysFromNow(-12),
  },
  {
    id: randomUUID(),
    nameJa: "業務システム刷新",
    nameEn: "Business System Modernization",
    price: "￥98,000–￥198,000",
    noteJa: "Excel・Access・旧PHPからの段階的なWeb移行",
    noteEn: "Phased migration from Excel, Access, or legacy PHP to a web system",
    sortOrder: 1,
    createdAt: daysFromNow(-12),
  },
  {
    id: randomUUID(),
    nameJa: "保守・伴走プラン",
    nameEn: "Maintenance & Support",
    price: "￥30,000 / ￥60,000 / ￥100,000–￥150,000",
    noteJa: "公開後の更新、監視、改善を月額でご支援します",
    noteEn: "Monthly support for updates, monitoring, and continuous improvement",
    sortOrder: 2,
    createdAt: daysFromNow(-12),
  },
];

const caseStudySeeds = [
  {
    id: randomUUID(),
    status: "published",
    metaJa: "自動車販売店",
    metaEn: "Auto dealership",
    titleJa: "スマートフォンからの問い合わせを改善",
    titleEn: "Better mobile inquiries for a local dealer",
    summaryJa: "古いサイトを整理し、車両情報と来店予約への導線を分かりやすくしました。",
    summaryEn: "We restructured an aging site and made vehicle information and visit requests easier to find.",
    imageUrl: "/brand/service_system_modernization_1795524958871.jpg",
    imageWidth: 1200,
    imageHeight: 896,
    sortOrder: 0,
    createdAt: daysFromNow(-10),
  },
  {
    id: randomUUID(),
    status: "published",
    metaJa: "レンタルプラットフォーム",
    metaEn: "Rental platform",
    titleJa: "予約フローを簡素化し運用負担を削減",
    titleEn: "Simplified booking and reduced operational overhead",
    summaryJa: "申込から確認までの一連の流れを見直し、担当者の手作業を減らしました。",
    summaryEn: "We reviewed the request-to-confirmation flow and reduced manual work for staff.",
    imageUrl: "/brand/service_security_inspection_1795524957677.jpg",
    imageWidth: 1200,
    imageHeight: 896,
    sortOrder: 1,
    createdAt: daysFromNow(-9),
  },
  {
    id: randomUUID(),
    status: "published",
    metaJa: "コワーキングアプリ",
    metaEn: "Co-working app",
    titleJa: "会員導線と情報設計を刷新",
    titleEn: "Renewed member journeys and information design",
    summaryJa: "会員向け案内と公開情報を整理し、初めての利用者にも分かりやすい構成にしました。",
    summaryEn: "We clarified public content and member guidance for first-time visitors and returning users.",
    imageUrl: "/brand/hero_tokyo_architecture_1795524957427.jpg",
    imageWidth: 1376,
    imageHeight: 768,
    sortOrder: 2,
    createdAt: daysFromNow(-8),
  },
  {
    id: randomUUID(),
    status: "draft",
    metaJa: "製造業",
    metaEn: "Manufacturing",
    titleJa: "Access台帳から権限付きWeb管理画面への並行移行",
    titleEn: "Parallel Migration from Legacy Access to Web Ledger",
    summaryJa: "製造現場の稼働を止めずにデータ検証と段階移行を実施。",
    summaryEn: "Validated records and phased the move without interrupting workshop operations.",
    imageUrl: "/brand/service_system_modernization_1795524958871.jpg",
    imageWidth: 1200,
    imageHeight: 896,
    sortOrder: 3,
    createdAt: daysFromNow(-3),
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("seed:demo must not run in production");
  }

  const db = getDb();
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@mirai-lab.local"))
    .limit(1);
  const [editor] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "editor@mirai-lab.local"))
    .limit(1);

  if (!admin || !editor) {
    throw new Error("Run pnpm seed:dev first to create the dev users");
  }

  await db.execute(sql.raw(`
    TRUNCATE TABLE
      lead_fields, lead_identities, score_snapshots, review_tasks, lead_feedback,
      merge_log, merge_candidates, source_records, ingest_runs, source_state, terms_snapshots,
      lead_activities, scans, documents, contact_requests, leads,
      posts, authors, media, do_not_contact,
      site_settings, pricing_tiers, case_studies,
      import_batches, audit_log, erasure_tombstones
    RESTART IDENTITY CASCADE
  `));

  await db
    .update(users)
    .set({ name: "Mika Sato", updatedAt: now() })
    .where(eq(users.id, admin.id));
  await db
    .update(users)
    .set({ name: "Kenji Tanaka", updatedAt: now() })
    .where(eq(users.id, editor.id));

  await db.insert(leads).values(
    leadSeeds.map((lead, index) => ({
      id: leadIds[index],
      company: lead.company,
      websiteUrl: lead.websiteUrl,
      segment: lead.segment,
      score: lead.score,
      stage: lead.stage,
      painFlags: [...lead.painFlags],
      lastContact: lead.stage === "new" ? null : daysFromNow(-4 - index),
      nextStep: lead.nextStep,
      nextStepDate: lead.nextStepDate,
      reachability: lead.reachability,
      sizeProxy: lead.sizeProxy,
      preferredTemplate: lead.preferredTemplate,
      latestScanAt: lead.scanStatus === "done" ? daysFromNow(-1 - (index % 4)) : null,
      latestScanStatus: lead.scanStatus,
      detailBriefMd: lead.detailBriefMd,
      corporateNumber: corporateNumber(index + 1),
      websiteStatus: lead.websiteStatus,
      sourceConfidence: lead.sourceConfidence,
      lastVerifiedAt: daysFromNow(-2 - index),
      reviewState: lead.reviewState,
      origin: lead.origin,
      dncBlocked: false,
      legacySystemStated: lead.legacySystemStated,
      painStated: lead.painStated,
      contactState: lead.contactState,
      createdAt: daysFromNow(-30 + index),
      updatedAt: daysFromNow(-1 - (index % 3)),
    })),
  );

  await db.insert(leadActivities).values(activitySeeds);

  await db.insert(scans).values(
    leadSeeds.map((lead, index) => ({
      leadId: leadIds[index],
      kind: index % 5 === 0 ? ("detail" as const) : ("scan" as const),
      status: lead.scanStatus,
      resultJson: {
        score: lead.score,
        tier: tierForScore(lead.score),
        flags: [...lead.painFlags],
        websiteStatus: lead.websiteStatus,
        summary: lead.detailBriefMd ?? "Scan still in progress or failed.",
      },
      createdAt: daysFromNow(-6 + (index % 5)),
      updatedAt: daysFromNow(-1 - (index % 3)),
    })),
  );

  await db.insert(contactRequests).values(
    contactSeeds.map((contact) => ({
      ...contact,
      createdAt: daysFromNow(-9 + Math.floor(Math.random() * 7)),
    })),
  );

  await db
    .insert(documents)
    .values(documentSeeds.map((document) => ({ ...document, taxBreakdown: [...document.taxBreakdown], lineItems: [...document.lineItems] })));

  const authorRows = await db
    .insert(authors)
    .values([
      { ...authorSeeds[0], userId: admin.id },
      { ...authorSeeds[1], userId: editor.id },
      { ...authorSeeds[2], userId: null },
    ])
    .returning({ id: authors.id });

  await db.insert(posts).values(
    postSeeds.map((post, index) => ({
      ...post,
      authorId: index % 2 === 0 ? admin.id : editor.id,
      createdAt: daysFromNow(-30 + index),
      updatedAt: daysFromNow(-1 - index),
    })),
  );

  await db.insert(media).values(
    mediaSeeds.map((item) => ({
      ...item,
      uploadedBy: admin.id,
      createdAt: daysFromNow(-18),
    })),
  );

  await db.insert(doNotContact).values(
    dncSeeds.map((entry) => ({
      ...entry,
      addedBy: admin.id,
      addedAt: daysFromNow(-16),
    })),
  );

  const siteValues = siteSettingsValues(admin.id);
  await db
    .insert(siteSettings)
    .values(siteValues)
    .onConflictDoUpdate({ target: siteSettings.id, set: siteValues });

  await db.insert(pricingTiers).values(pricingSeeds);
  await db.insert(caseStudies).values(caseStudySeeds);

  console.log(
    JSON.stringify(
      {
        leads: leadSeeds.length,
        activities: activitySeeds.length,
        scans: leadSeeds.length,
        contactRequests: contactSeeds.length,
        documents: documentSeeds.length,
        posts: postSeeds.length,
        authors: authorRows.length,
        media: mediaSeeds.length,
        dnc: dncSeeds.length,
        pricingTiers: pricingSeeds.length,
        caseStudies: caseStudySeeds.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
