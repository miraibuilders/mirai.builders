export type Locale = "ja" | "en";

export type LegalSlug = "privacy" | "terms" | "tokushoho" | "security-policy";

export type ContactFieldKey =
  | "company"
  | "name"
  | "email"
  | "phone"
  | "topic"
  | "websiteUrl"
  | "message"
  | "consent";

export type ContactErrorCode =
  | "required"
  | "invalidEmail"
  | "invalidPhone"
  | "invalidTopic"
  | "invalidUrl"
  | "tooLong";

export interface NavItem {
  label: string;
  href: string;
}

export interface CheckItem {
  label: string;
  status: string;
  tone: "ok" | "warn";
  detail: string;
}

export interface ProblemItem {
  number: string;
  segment: string;
  title: string;
  description: string;
}

export interface ReasonItem {
  number: string;
  title: string;
  description: string;
}

export interface ServiceItem {
  number: string;
  title: string;
  summary: string;
  audienceLabel: string;
  audience: string;
  scopeLabel: string;
  scope: string;
  deliverableLabel: string;
  deliverable: string;
  ctaLabel: string;
}

export interface PlanItem {
  number: string;
  name: string;
  price: string;
  taxNote: string;
  summary: string;
  items: string[];
  recommended?: boolean;
  recommendedLabel?: string;
}

export interface StepItem {
  number: string;
  title: string;
  duration: string;
  description: string;
}

export interface CommitmentItem {
  number: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CompanyRow {
  label: string;
  value: string;
}

export interface ContactFieldCopy {
  label: string;
  requiredLabel: string;
  optionalLabel: string;
  placeholder: string;
  help?: string;
}

export interface LegalSection {
  number: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: LegalSlug;
  eyebrow: string;
  title: string;
  description: string;
  lead: string;
  updatedLabel: string;
  updatedValue: string;
  sections: LegalSection[];
  rows?: CompanyRow[];
  ctaTitle: string;
  ctaBody: string;
}

export interface LandingContent {
  locale: Locale;
  brand: {
    wordmark: string;
    legalName: string;
    logoAlt: string;
  };
  a11y: {
    skipLink: string;
    mainNavLabel: string;
    mobileNavLabel: string;
    openMenuLabel: string;
    closeMenuLabel: string;
    phoneLinkPrefix: string;
    footerNavLabel: string;
  };
  header: {
    nav: NavItem[];
    phoneDisplay: string;
    phoneTel: string;
    hours: string;
    ctaLabel: string;
    accountLabel: string;
    languageLabel: string;
    jaLabel: string;
    enLabel: string;
    adminLabel: string;
  };
  loader: {
    eyebrow: string;
    label: string;
    skipLabel: string;
  };
  stickyBar: {
    callLabel: string;
    consultLabel: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    subheadline: string;
    image?: { src: string; width: number; height: number; alt: string } | null;
    trustChips: string[];
    primaryCta: string;
    secondaryCta: string;
    phoneLabel: string;
    sampleCard: {
      badge: string;
      status: string;
      title: string;
      caption: string;
      items: CheckItem[];
    };
  };
  problems: {
    eyebrow: string;
    title: string;
    lead: string;
    segmentsLabel: string;
    segments: string[];
    items: ProblemItem[];
  };
  reasons: {
    eyebrow: string;
    title: string;
    items: ReasonItem[];
  };
  services: {
    eyebrow: string;
    title: string;
    items: ServiceItem[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    estimateNote: string;
    plans: PlanItem[];
    midCtaText: string;
    midCtaButton: string;
  };
  flow: {
    eyebrow: string;
    title: string;
    durationLabel: string;
    steps: StepItem[];
  };
  commitments: {
    eyebrow: string;
    title: string;
    items: CommitmentItem[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: FaqItem[];
  };
  company: {
    eyebrow: string;
    title: string;
    rows: CompanyRow[];
  };
  caseStudies: {
    eyebrow: string;
    title: string;
    lead: string;
    items: Array<{
      meta: string;
      title: string;
      summary: string;
      image?: { src: string; width: number; height: number; alt: string } | null;
    }>;
  };
  contact: {
    eyebrow: string;
    title: string;
    lead: string;
    phoneHeading: string;
    hoursPrefix: string;
    replyLabel: string;
    replyValue: string;
    nextStepsHeading: string;
    nextSteps: string[];
    form: {
      topics: string[];
      topicPlaceholder: string;
      noWebsiteLabel: string;
      consentPrefix: string;
      privacyLabel: string;
      consentSuffix: string;
      submitLabel: string;
      submittingLabel: string;
      successTitle: string;
      successBody: string;
      errorTitle: string;
      spamMessage: string;
      errorMessage: string;
      errorCodes: Record<ContactErrorCode, string>;
      fields: Record<ContactFieldKey, ContactFieldCopy>;
    };
  };
  footer: {
    eyebrow: string;
    title: string;
    body: string;
    ctaLabel: string;
    tagline: string;
    columns: Array<{ title: string; items: NavItem[] }>;
    backToTopLabel: string;
    copyright: string;
  };
  legal: Record<LegalSlug, LegalDocument>;
}
