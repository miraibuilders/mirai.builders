import { t } from "@/content/site";
import type { MergedSiteContent } from "@/lib/settings";
import type { LandingContent } from "../types";
import { legalContent } from "./legal";

export function enContent(site: MergedSiteContent): LandingContent {
  const legalName = "MIRAI Lab";
  const phone = site.contact.phone;
  const phoneTel = phone.replace(/[^\d+]/g, "");
  const email = t(site.contact.email, "en");
  const address = t(site.contact.address, "en");
  const representative = t(site.about.authorName, "en");
  const hours = "Weekdays 9:00–18:00";
  const hoursLabel = "Weekdays";
  const serviceArea = "Japan-wide remote support, Chuo-ku Tokyo";
  const replySla = "Within 1 business day";
  const copyrightSource = t(site.footer.copyright, "en").trim() || legalName;
  const year = site.year.en;
  const copyright = copyrightSource.includes(year) ? copyrightSource : `${copyrightSource} ${year}`;
  const heroHeadline = t(site.hero.headline, "en");
  const heroSplitIndex = heroHeadline.indexOf(", ");
  const headline = heroSplitIndex >= 0 ? heroHeadline.slice(0, heroSplitIndex + 2) : heroHeadline;
  const headlineAccent = heroSplitIndex >= 0 ? heroHeadline.slice(heroSplitIndex + 2) : "";
  const heroSubheadline = t(site.hero.subheadline, "en");
  const heroCta = t(site.hero.cta, "en");
  const heroImage = site.hero.image
    ? { ...site.hero.image, alt: t(site.hero.image.alt, "en") }
    : null;
  const priceWebsite = site.pricing[0]?.price ?? "￥29,800";
  const priceSystem = site.pricing[1]?.price ?? "￥98,000–￥198,000";
  const priceRetainer = site.pricing[2]?.price ?? "￥30,000 / ￥60,000 / ￥100,000–￥150,000";

  return {
    locale: "en",
    brand: {
      wordmark: "MIRAI Lab",
      legalName,
      logoAlt: "MIRAI Lab logo",
    },
    a11y: {
      skipLink: "Skip to main content",
      mainNavLabel: "Primary navigation",
      mobileNavLabel: "Mobile navigation",
      openMenuLabel: "Open menu",
      closeMenuLabel: "Close menu",
      phoneLinkPrefix: "Call",
      footerNavLabel: "Footer navigation",
    },
    header: {
      nav: [
        { label: "Challenges", href: "/#problems" },
        { label: "Services", href: "/#services" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Process", href: "/#flow" },
        { label: "Blog", href: "/blog" },
        { label: "Company", href: "/#company" },
        { label: "Contact", href: "/#contact" },
      ],
      phoneDisplay: phone,
      phoneTel,
      hours,
      ctaLabel: "Free Consultation",
      accountLabel: "Log in",
      languageLabel: "Switch language",
      jaLabel: "日本語",
      enLabel: "English",
      adminLabel: "Admin",
    },
    loader: {
      eyebrow: "MIRAI LAB",
      label: "Loading…",
      skipLabel: "Skip",
    },
    stickyBar: {
      callLabel: "Call",
      consultLabel: "Free Consultation",
    },
    hero: {
      eyebrow: "WEB & SYSTEMS SUPPORT FOR JAPANESE SMBs",
      headline,
      headlineAccent,
      subheadline: heroSubheadline,
      image: heroImage,
      trustChips: [
        "Non-intrusive public check",
        "3-person team, Japanese support",
        "PDF NDA, quotes & invoices",
      ],
      primaryCta: heroCta,
      secondaryCta: "View Pricing Guide",
      phoneLabel: "Call Us",
      sampleCard: {
        badge: "Sample report",
        status: "Public data only",
        title: "Free Health Check Report",
        caption:
          "Illustrative example. We do not log in to the site, attack it, or submit forms; we review publicly visible information only.",
        items: [
          {
            label: "HTTPS & TLS Certificate",
            status: "Checked",
            tone: "ok",
            detail: "Reviews certificate expiry and baseline encryption settings.",
          },
          {
            label: "HTTP Response Headers",
            status: "Review item",
            tone: "warn",
            detail: "Checks server disclosure and essential header configuration.",
          },
          {
            label: "SPF / DKIM / DMARC",
            status: "Checked",
            tone: "ok",
            detail: "Reviews published DNS email-authentication records.",
          },
          {
            label: "Publicly Exposed Files",
            status: "Review item",
            tone: "warn",
            detail: "Looks for configuration or backup files left publicly accessible.",
          },
        ],
      },
    },
    problems: {
      eyebrow: "PROBLEMS",
      title: "Do Any of These Sound Familiar?",
      lead: "We turn everyday website and workflow problems into a clear, practical plan.",
      segmentsLabel: "Typical Sectors",
      segments: [
        "Accountants, labor offices & clinics",
        "Auto repair shops",
        "Inbound tourism",
        "Small manufacturers & wholesalers",
        "Foreign-owned SMBs in Japan",
      ],
      items: [
        {
          number: "01",
          segment: "Existing site",
          title: "An outdated site that is hard to use on mobile",
          description:
            "A site built years ago does not display properly on smartphones, and its information is rarely updated.",
        },
        {
          number: "02",
          segment: "Security",
          title: "Unclear HTTPS or certificate status",
          description:
            "Visitors see browser warnings, or nobody is tracking when the TLS certificate expires.",
        },
        {
          number: "03",
          segment: "Maintenance",
          title: "An unmaintained CMS or legacy PHP environment",
          description:
            "The original vendor is unreachable, and aging software continues to run with growing risk.",
        },
        {
          number: "04",
          segment: "Operations",
          title: "Person-dependent Excel and Access workflows",
          description:
            "Critical records live in fragile local files, making it hard for several people to work safely.",
        },
        {
          number: "05",
          segment: "New setup",
          title: "No company website yet",
          description:
            "Partners and visitors increasingly look online, but you are unsure where to begin.",
        },
        {
          number: "06",
          segment: "Communication",
          title: "No approachable Japanese-language contact",
          description:
            "You want practical explanations in Japanese for daily operations and coordination with an overseas head office.",
        },
      ],
    },
    reasons: {
      eyebrow: "REASONS",
      title: "Why Businesses Work With Us",
      items: [
        {
          number: "01",
          title: "Passive checks based on public information",
          description:
            "We review only what is publicly visible: HTTP response headers, TLS certificates, DNS email-authentication records, and public files. We never log in, attack, or submit forms.",
        },
        {
          number: "02",
          title: "Direct support from a three-person team",
          description:
            "Engineering, security, AI/web implementation, and client communication are handled directly by three specialists, keeping diagnosis, proposal, and build aligned.",
        },
        {
          number: "03",
          title: "PDF documents for internal approval",
          description:
            "We issue NDAs, written quotes, invoices, and acceptance documents as PDFs, ready for comparison, approval, and accounting.",
        },
      ],
    },
    services: {
      eyebrow: "SERVICE",
      title: "Three Core Services",
      items: [
        {
          number: "01",
          title: "Free Website Health Check",
          summary:
            "A passive review of publicly visible configuration issues and certificate risks on your current site.",
          audienceLabel: "Audience",
          audience: "SMBs and professional offices that want an external risk overview",
          scopeLabel: "Scope",
          scope:
            "HTTP response headers, TLS certificate, DNS email authentication (SPF/DKIM/DMARC), publicly exposed files",
          deliverableLabel: "Deliverable",
          deliverable: "PDF report with findings and prioritized next steps",
          ctaLabel: "Request a Health Check",
        },
        {
          number: "02",
          title: "Website Build & Renewal",
          summary:
            "A first business website or a renewal that makes an aging site clear, structured, and mobile-friendly.",
          audienceLabel: "Audience",
          audience: "Businesses launching a first site or renewing an outdated one",
          scopeLabel: "Scope",
          scope: "Information structure, responsive implementation, inquiry flow, baseline setup",
          deliverableLabel: "Deliverable",
          deliverable: "Production website and operational handover notes",
          ctaLabel: "Discuss a Website Build",
        },
        {
          number: "03",
          title: "Business System Modernization",
          summary:
            "Move fragile spreadsheets, Access files, and legacy PHP into maintainable web systems, one step at a time.",
          audienceLabel: "Audience",
          audience: "Teams outgrowing Excel, Access, or aging PHP tools",
          scopeLabel: "Scope",
          scope: "Workflow review, data structure design, web system implementation and migration",
          deliverableLabel: "Deliverable",
          deliverable: "Web application, usage guide, and PDF acceptance documents",
          ctaLabel: "Discuss System Modernization",
        },
      ],
    },
    pricing: {
      eyebrow: "PRICING",
      title: "Pricing Guide",
      estimateNote: "Prices excl. tax ・ Free estimates",
      plans: [
        {
          number: "01",
          name: "Free Website Health Check",
          price: "Free",
          taxNote: "No charge",
          summary: "Passive public check with a prioritized summary",
          items: [
            "HTTP headers and TLS certificate review",
            "DNS email-authentication check",
            "Publicly exposed file check",
            "PDF report and next-step recommendations",
          ],
          recommended: true,
          recommendedLabel: "Start here",
        },
        {
          number: "02",
          name: "Website Build & Renewal",
          price: priceWebsite,
          taxNote: "Excl. tax",
          summary: "First website launch or mobile-friendly renewal",
          items: [
            "Page structure planning",
            "Responsive implementation",
            "Inquiry form setup",
            "PDF quote and invoice",
          ],
        },
        {
          number: "03",
          name: "System Modernization",
          price: priceSystem,
          taxNote: "Excl. tax",
          summary: "Transition from Excel, Access, or legacy PHP",
          items: [
            "Current workflow mapping",
            "Screen and data design",
            "Phased web build and testing",
            "PDF acceptance and handover",
          ],
        },
        {
          number: "04",
          name: "Maintenance & Support",
          price: priceRetainer,
          taxNote: "Excl. tax",
          summary: "Ongoing help with operations, improvements, and periodic reviews",
          items: [
            "Dedicated point of contact for operations",
            "Small fixes and improvement requests",
            "Periodic public-information reviews",
            "Monthly status sharing and recommendations",
          ],
        },
      ],
      midCtaText:
        "We prepare a written PDF quote tailored to your scope and budget, with each deliverable itemized.",
      midCtaButton: "Request a Free Estimate",
    },
    flow: {
      eyebrow: "FLOW",
      title: "From First Contact to Launch",
      durationLabel: "Est.",
      steps: [
        {
          number: "01",
          title: "Inquiry",
          duration: "Same day–1 business day",
          description: "Tell us your current challenge and the target URL by form or phone.",
        },
        {
          number: "02",
          title: "Free Hearing",
          duration: "30–45 min",
          description: "We review your workflow, priorities, schedule, and budget online or by phone.",
        },
        {
          number: "03",
          title: "Quote & Proposal",
          duration: "3–5 business days",
          description: "We share findings or a defined scope with a written PDF quote and plan.",
        },
        {
          number: "04",
          title: "Build & Development",
          duration: "2–6 weeks",
          description: "Implementation proceeds with regular checkpoints and room for your feedback.",
        },
        {
          number: "05",
          title: "Handover & Support",
          duration: "1 week",
          description: "Acceptance documents are issued after launch checks, with support afterward.",
        },
      ],
    },
    commitments: {
      eyebrow: "COMMITMENTS",
      title: "Our Commitments",
      items: [
        {
          number: "01",
          title: "Strictly non-intrusive diagnostics",
          description:
            "Checks use publicly visible information only. Without prior agreement, we never attempt logins, run heavy scans, or submit forms.",
        },
        {
          number: "02",
          title: "Clear written documentation",
          description:
            "NDAs, written quotes, invoices, and acceptance documents are issued as PDFs for internal approval and accounting.",
        },
        {
          number: "03",
          title: "Direct three-person team",
          description:
            "Engineering, security, AI/web, and client coordination stay aligned across three specialists, with plain explanations of the technical background.",
        },
        {
          number: "04",
          title: "Japan-based Japanese-language support",
          description:
            "A Japan-based team member serves as your primary contact, so daily communication stays clear and practical in Japanese.",
        },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently Asked Questions",
      items: [
        {
          question: "Does the free health check log in to our server or submit forms?",
          answer:
            "No. It reviews only publicly visible data such as HTTP response headers, TLS certificates, DNS email-authentication records, and public files.",
        },
        {
          question: "Can we talk to you before we have a website?",
          answer:
            "Yes. We support first website launches as well as renewals of existing sites, starting with structure and content planning.",
        },
        {
          question: "Can internal Excel or Access tools be replaced with a web system?",
          answer:
            "Yes. We modernize fragile spreadsheets, Access files, and legacy PHP into maintainable web systems.",
        },
        {
          question: "Can you issue NDAs, quotes, invoices, and acceptance documents?",
          answer: "Yes. All of these documents can be issued as formal PDF files.",
        },
        {
          question: "Are estimates free, and how long do they take?",
          answer: "Estimates are free. Typical quote turnaround is 3–5 business days.",
        },
        {
          question: "Which areas do you support?",
          answer:
            `${serviceArea}. Online meetings are our main format, and we support you in Japanese throughout.`,
        },
        {
          question: "Are there minimum contract terms or post-launch fees?",
          answer:
            `Contract terms and scope are stated in the written quote. Maintenance and support plans start at ${priceRetainer}.`,
        },
        {
          question: "What payment methods and terms do you accept?",
          answer:
            "Payment methods and due dates are stated in the quote and invoice. Please tell us in advance if you have specific requirements.",
        },
      ],
    },
    company: {
      eyebrow: "COMPANY",
      title: "Company Profile",
      rows: [
        { label: "Company name", value: legalName },
        { label: "Representative", value: representative },
        { label: "Address", value: address },
        { label: "Phone & hours", value: `${phone} (${hours})` },
        { label: "Email", value: email },
        { label: "Service area", value: serviceArea },
        {
          label: "Services",
          value:
            "Free Website Health Check (public information only) / Website Build & Renewal / Business System Modernization",
        },
      ],
    },
    caseStudies: {
      eyebrow: "CASE STUDIES",
      title: "Selected Work",
      lead: "A look at how we have supported different sectors, from public-information checks to web builds and system modernization.",
      items: site.caseStudies.map((item) => ({
        meta: t(item.meta, "en"),
        title: t(item.title, "en"),
        summary: t(item.summary, "en"),
        image: item.image ? { ...item.image, alt: t(item.title, "en") } : null,
      })),
    },
    contact: {
      eyebrow: "CONTACT",
      title: "Request a Free Consultation",
      lead: "You do not need a finalized specification. Tell us where things stand and we will guide the next step.",
      phoneHeading: "Call Us Directly",
      hoursPrefix: hoursLabel,
      replyLabel: "Expected reply",
      replyValue: replySla,
      nextStepsHeading: "What Happens Next",
      nextSteps: [
        "We review your inquiry and follow up directly.",
        "We hold a free hearing online or by phone to clarify your needs.",
        "You receive health check findings or a written PDF quote.",
      ],
      form: {
        topics: [
          "Free Website Health Check",
          "Website Build & Renewal",
          "Business System Modernization",
          "Security Consultation",
          "Other",
        ],
        topicPlaceholder: "Select a consultation topic",
        noWebsiteLabel: "We do not have a website yet",
        consentPrefix: "I agree to the ",
        privacyLabel: "Privacy Policy",
        consentSuffix: "",
        submitLabel: "Submit Consultation Request",
        submittingLabel: "Sending…",
        successTitle: "Thank you for your inquiry",
        successBody: `We have received your request and will reply ${replySla}.`,
        errorTitle: "Please review the highlighted fields below.",
        spamMessage: "Your submission could not be processed. Please wait a moment and try again.",
        errorMessage: "Something went wrong while sending. Please try again.",
        errorCodes: {
          required: "This field is required.",
          invalidEmail: "Please enter a valid email address.",
          invalidPhone: "Please enter a 10- or 11-digit phone number.",
          invalidTopic: "Please select a consultation topic.",
          invalidUrl: "Please enter a valid http:// or https:// URL.",
          tooLong: "Please keep your message within 1,000 characters.",
        },
        fields: {
          company: {
            label: "Company / Organization",
            requiredLabel: "Required",
            optionalLabel: "Optional",
            placeholder: "MIRAI Co., Ltd.",
            help: "Enter your company, office, or sole proprietor name.",
          },
          name: {
            label: "Contact Name",
            requiredLabel: "Required",
            optionalLabel: "Optional",
            placeholder: "Taro Yamada",
            help: "Enter your full name.",
          },
          email: {
            label: "Email Address",
            requiredLabel: "Required",
            optionalLabel: "Optional",
            placeholder: "name@example.co.jp",
            help: "We will send our reply to this address.",
          },
          phone: {
            label: "Phone Number",
            requiredLabel: "Required",
            optionalLabel: "Optional",
            placeholder: phone,
            help: "10 or 11 digits, with or without hyphens.",
          },
          topic: {
            label: "Topic",
            requiredLabel: "Required",
            optionalLabel: "Optional",
            placeholder: "Select a consultation topic",
            help: "Choose the closest topic.",
          },
          websiteUrl: {
            label: "Website URL",
            requiredLabel: "Required",
            optionalLabel: "Optional",
            placeholder: "https://example.co.jp",
            help: "Target site for a health check or renewal. Leave blank if none exists yet.",
          },
          message: {
            label: "Details",
            requiredLabel: "Required",
            optionalLabel: "Optional",
            placeholder: "Current website or internal workflow",
            help: "Optional background or timeline, up to 1,000 characters.",
          },
          consent: {
            label: "Privacy Consent",
            requiredLabel: "Required",
            optionalLabel: "Optional",
            placeholder: "",
            help: "Please review and confirm before submitting.",
          },
        },
      },
    },
    footer: {
      eyebrow: "FIRST STEP",
      title: "Start With a Non-Intrusive Website Check",
      body: "From public-information checks to PDF quotes for web builds and system modernization, we support you directly in Japanese.",
      ctaLabel: "Request a Free Consultation",
      tagline:
        "Supporting SMBs and professional offices in Japan with passive public website checks, web builds, and modernization from spreadsheets, Access, and legacy PHP.",
      columns: [
        {
          title: "Services & Guidance",
          items: [
            { label: "Challenges", href: "/#problems" },
            { label: "Services", href: "/#services" },
            { label: "Pricing", href: "/#pricing" },
            { label: "Process", href: "/#flow" },
            { label: "Company", href: "/#company" },
          ],
        },
        {
          title: "Contact & Information",
          items: [
            { label: "Contact", href: "/#contact" },
            { label: "Blog", href: "/blog" },
            { label: "Security Policy", href: "/security-policy" },
          ],
        },
        {
          title: "Legal",
          items: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Commercial Transactions Notice", href: "/tokushoho" },
          ],
        },
      ],
      backToTopLabel: "Back to top",
      copyright,
    },
    legal: legalContent("en", site),
  };
}
