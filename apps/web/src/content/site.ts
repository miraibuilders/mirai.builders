export type Locale = "ja" | "en";
export type Localized = { ja: string; en: string };

export function t(value: Localized, locale: Locale): string {
  return value[locale];
}

const year = String(new Date().getFullYear());

export const siteContent = {
  brand: {
    name: { ja: "MIRAI Lab", en: "MIRAI Lab" },
    tagline: {
      ja: "中小企業のWebと業務を、実務に即して整える",
      en: "Practical web and systems support for growing businesses",
    },
    description: {
      ja: "公開情報のみを確認する無料サイト診断、ホームページ制作・リニューアル、表計算やAccess・旧PHPからの業務システム刷新を提供します。",
      en: "MIRAI Lab provides passive website health checks, website builds and renewals, and practical modernization of spreadsheets, Access files, and legacy PHP systems.",
    },
  },
  contact: {
    phone: "03-5555-0188",
    structuredDataEmail: "contact@example.jp",
    email: {
      ja: "contact@example.jp",
      en: "contact@example.jp",
    },
    address: {
      ja: "東京都中央区日本橋1-2-3 4F",
      en: "1-2-3 Nihonbashi, Chuo-ku, Tokyo",
    },
  },
  hero: {
    headline: {
      ja: "公開情報から始めて、Webと業務を整える。",
      en: "Practical web security and systems, starting with public signals.",
    },
    subheadline: {
      ja: "公開情報のみを確認する無料サイト診断から、初めてのホームページ制作、表計算・Access等の業務改善まで一貫してご相談いただけます。",
      en: "From non-intrusive website health checks to first-time company websites and modernization of fragile spreadsheets, Access files, and legacy PHP systems.",
    },
    cta: {
      ja: "無料相談を申し込む",
      en: "Request a free consultation",
    },
  },
  offer: {
    name: {
      ja: "無料サイト診断",
      en: "Free Website Health Check",
    },
    price: 0,
    description: {
      ja: "HTTP応答ヘッダ、TLS証明書、DNSメール認証、公開ファイルを外部から確認し、優先対応事項をまとめます。",
      en: "A passive review of HTTP response headers, TLS certificates, DNS email authentication, and publicly exposed files, with prioritized next steps.",
    },
  },
  pricing: [
    {
      name: {
        ja: "ホームページ制作・刷新",
        en: "Website Build & Renewal",
      },
      price: "￥29,800",
      note: {
        ja: "スマートフォン対応とお問い合わせ導線を含む基本プラン",
        en: "Starter plan with responsive pages and a working contact flow",
      },
    },
    {
      name: {
        ja: "業務システム刷新",
        en: "Business System Modernization",
      },
      price: "￥98,000–￥198,000",
      note: {
        ja: "Excel・Access・旧PHPからの段階的なWeb移行",
        en: "Phased migration from Excel, Access, or legacy PHP to a web system",
      },
    },
    {
      name: {
        ja: "保守・伴走プラン",
        en: "Maintenance & Support",
      },
      price: "￥30,000 / ￥60,000 / ￥100,000–￥150,000",
      note: {
        ja: "公開後の更新、監視、改善を月額でご支援します",
        en: "Monthly support for updates, monitoring, and continuous improvement",
      },
    },
  ],
  caseStudies: [
    {
      meta: { ja: "自動車販売店", en: "Auto dealership" },
      title: {
        ja: "スマートフォンからの問い合わせを改善",
        en: "Better mobile inquiries for a local dealer",
      },
      summary: {
        ja: "古いサイトを整理し、車両情報と来店予約への導線を分かりやすくしました。",
        en: "We restructured an aging site and made vehicle information and visit requests easier to find.",
      },
    },
    {
      meta: { ja: "レンタルプラットフォーム", en: "Rental platform" },
      title: {
        ja: "予約 Flow を簡素化し運用負担を削減",
        en: "Simplified booking and reduced operational overhead",
      },
      summary: {
        ja: "申込から確認までの一連の流れを見直し、担当者の手作業を減らしました。",
        en: "We reviewed the request-to-confirmation flow and reduced manual work for staff.",
      },
    },
    {
      meta: { ja: "コワーキングアプリ", en: "Co-working app" },
      title: {
        ja: "会員導線と情報設計を刷新",
        en: "Renewed member journeys and information design",
      },
      summary: {
        ja: "会員向け案内と公開情報を整理し、初めての利用者にも分かりやすい構成にしました。",
        en: "We clarified public content and member guidance for first-time visitors and returning users.",
      },
    },
  ],
  about: {
    authorName: { ja: "ミライラボ 代表", en: "MIRAI Lab" },
    authorTitle: {
      ja: "代表・技術責任者",
      en: "Representative & Technical Lead",
    },
  },
  footer: {
    copyright: {
      ja: "MIRAI Lab. All rights reserved.",
      en: "MIRAI Lab. All rights reserved.",
    },
  },
  year: { ja: year, en: year },
  sectionTitles: {
    heroKicker: {
      ja: "中小企業のためのWeb・業務支援",
      en: "Web & operations support for SMBs",
    },
    pricing: {
      ja: "料金の目安",
      en: "Pricing guide",
    },
    pricingLead: {
      ja: "ご予算とご希望範囲に合わせて個別にお見積りを作成します。",
      en: "We prepare an itemized quote tailored to your scope and budget.",
    },
    pricingFootnote: {
      ja: "表示価格は税別です。正式な金額はお見積書でご提示します。",
      en: "Prices exclude tax. The final amount is provided in a written quote.",
    },
    caseStudies: {
      ja: "支援事例",
      en: "Selected work",
    },
    caseStudiesLead: {
      ja: "Web_siteと業務システムの両面から、実務に直結する改善を進めています。",
      en: "We improve both public websites and internal systems with practical day-to-day impact.",
    },
    contact: {
      ja: "お問い合わせ",
      en: "Contact",
    },
    contactLead: {
      ja: "対象サイトのURL、現在のお困りごと、ご希望の納期やご予算をお知らせください。",
      en: "Send the target URL, your current challenge, preferred schedule, and budget.",
    },
    contactNameLabel: {
      ja: "ご担当者",
      en: "Contact",
    },
    contactPhoneLabel: {
      ja: "電話",
      en: "Phone",
    },
    contactNote: {
      ja: "お電話でのご相談は平日 9:00〜18:00 にお願いします。",
      en: "Phone consultations are available weekdays, 9:00–18:00.",
    },
  },
  formLabels: {
    name: {
      ja: "ご担当者名",
      en: "Contact name",
    },
    company: {
      ja: "会社名・屋号",
      en: "Company / organization",
    },
    email: {
      ja: "メールアドレス",
      en: "Email address",
    },
    phone: {
      ja: "電話番号",
      en: "Phone number",
    },
    message: {
      ja: "ご相談内容",
      en: "How can we help?",
    },
    website: {
      ja: "ウェブサイト（入力しないでください）",
      en: "Website (leave blank)",
    },
    submit: {
      ja: "送信する",
      en: "Send inquiry",
    },
    submitting: {
      ja: "送信中…",
      en: "Sending…",
    },
    success: {
      ja: "お問い合わせありがとうございます。1営業日以内にご返信します。",
      en: "Thank you for your inquiry. We will reply within one business day.",
    },
    privacyNote: {
      ja: "ご入力いただいた情報は、お問い合わせへの対応と診断のご案内にのみ使用します。",
      en: "Your information is used only to respond to your inquiry and prepare the requested guidance.",
    },
  },
  formErrors: {
    required: {
      ja: "必須項目を入力してください。",
      en: "Please complete all required fields.",
    },
    email: {
      ja: "メールアドレスの形式をご確認ください。",
      en: "Please enter a valid email address.",
    },
    tooLong: {
      ja: "入力内容が長すぎます。",
      en: "One or more fields are too long.",
    },
    generic: {
      ja: "送信に失敗しました。少し待ってからもう一度お試しください。",
      en: "We could not submit your inquiry. Please try again shortly.",
    },
  },
  metaDescriptions: {
    root: {
      ja: "MIRAI Labは、中小企業向けの無料サイト診断、Web制作、業務システム刷新を提供します。",
      en: "MIRAI Lab provides passive website health checks, web design, and business system modernization for small businesses.",
    },
    marketing: {
      ja: "中小企業・個人事務所向けの無料サイト診断、ホームページ制作・リニューアル、業務システム刷新はMIRAI Labへ。",
      en: "Passive website health checks, website builds and renewals, and business system modernization for small businesses and professional offices.",
    },
    blogIndex: {
      ja: "MIRAI Labのブログ。Webサイト、セキュリティ、業務改善に関する実務的な記事を掲載しています。",
      en: "The MIRAI Lab blog: practical articles on websites, security, and operational improvement.",
    },
    blogPostNotFound: {
      ja: "お探しの記事は見つかりませんでした。",
      en: "The requested article could not be found.",
    },
  },
  photoAlt: {
    ja: "MIRAI Lab の担当者写真",
    en: "MIRAI Lab team photo",
  },
  blogPage: {
    title: {
      ja: "ブログ",
      en: "Blog",
    },
    lead: {
      ja: "Webサイト、公開情報の安全性、日々の業務改善に関する実務的なヒントを発信します。",
      en: "Practical guidance on websites, public-information safety, and everyday operational improvement.",
    },
    empty: {
      ja: "記事はまだ公開されていません。",
      en: "No articles have been published yet.",
    },
    back: {
      ja: "ブログ一覧へ戻る",
      en: "Back to blog",
    },
    datePlaceholder: {
      ja: "公開日未定",
      en: "Date to be announced",
    },
    summaryPlaceholder: {
      ja: "記事の概要を準備中です。",
      en: "A summary is being prepared.",
    },
    authorPlaceholder: {
      ja: "MIRAI Lab 編集部",
      en: "MIRAI Lab Editorial Team",
    },
  },
  loginPage: {
    title: {
      ja: "ログイン",
      en: "Log in",
    },
    email: {
      ja: "メールアドレス",
      en: "Email address",
    },
    password: {
      ja: "パスワード",
      en: "Password",
    },
    submit: {
      ja: "ログイン",
      en: "Log in",
    },
    failed: {
      ja: "メールアドレスまたはパスワードが正しくありません。",
      en: "The email address or password is incorrect.",
    },
  },
  llmsTxt: {
    description: {
      ja: "MIRAI Labは、中小企業向けの無料サイト診断、Web制作、業務システム刷新を行う実務支援チームです。",
      en: "MIRAI Lab provides passive website health checks, web design, and business system modernization for small businesses.",
    },
    home: {
      ja: "ホーム",
      en: "Home",
    },
    blog: {
      ja: "ブログ",
      en: "Blog",
    },
    externalCheckNote: {
      ja: "公開情報のみを確認する非侵入型のサイト診断です。",
      en: "A non-intrusive check using publicly visible information only.",
    },
    noPosts: {
      ja: "公開記事はまだありません。",
      en: "No published articles yet.",
    },
    crawlersLine: {
      ja: "クローラーの方へ: 公開ページとllms.txtを参照してください。",
      en: "For crawlers: please refer to the public pages and this llms.txt.",
    },
  },
};
