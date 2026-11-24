"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanding } from "./landing-provider";

const teamImages = [
  "/brand/team_client_lead_1795527162144.jpg",
  "/brand/team_security_architect_1795527162282.jpg",
  "/brand/team_systems_engineer_1795527162650.jpg",
] as const;

const editorialCopy = {
  ja: {
    facts: [
      { label: "対応体制", value: "日本国内窓口・3名直営チーム" },
      { label: "無料サイト診断", value: "公開情報のみ・非侵入型点検" },
      { label: "対応範囲", value: "Web制作・刷新 / 脱Excel・Access・旧PHP" },
      { label: "正式書類対応", value: "NDA・御見積書・請求書・検収書 PDF発行" },
    ],
    sectors: {
      sectionNumber: "01",
      title: "このような現場の課題に向き合っています",
      subtitle:
        "初めてWebサイトを作る事業者様から、既存システムの老朽化やメール認証の不安を抱える現場まで、業種ごとの実務事情を踏まえて整理します。",
      painLabel: "よくあるお悩み",
      focusLabel: "MIRAI Labの確認視点",
      signalsLabel: "優先して確認する公開シグナル",
    },
    health: {
      index: "03. 無料サイト診断（非侵入型点検）",
      title: "公開情報のみを確認する、安全な非侵入型サイト点検",
      lead: "「自社サイトやドメインが外部からどう見えているか」を、業務へ一切負荷をかけずに確認します。ログイン試行、攻撃コマンドの送信、問い合わせフォームのテスト送信は行いません。",
      guaranteeTitle: "診断における厳格な境界線",
      guaranteePoints: [
        "確認対象は外部に公開されている信号のみ（HTTP応答ヘッダー・TLS証明書・公開DNS・意図せず公開されたファイル有無）",
        "管理画面へのログイン試行やブルートフォース、脆弱性スキャナの連続攻撃は一切実施しません",
        "問い合わせフォームへの自動送信やデータ改変を行わないため、通常業務に影響しません",
      ],
      boundaryLabel: "非侵入範囲の確認事項",
      cta: "無料サイト診断を申し込む",
      imageAlt: "透明な光学プリズムによる非侵入型の技術点検イメージ",
    },
    signals: [
      {
        code: "01 / HTTP",
        title: "HTTPレスポンスヘッダー",
        detail:
          "ブラウザが通信を正しく保護できているか、クリックジャッキングや意図しない埋め込みを防ぐ基本設定が公開応答に含まれているかを確認します。",
        boundary:
          "公開トップページ等への通常のGET応答ヘッダーのみを確認し、ログインやパラメータ改変は一切行いません。",
      },
      {
        code: "02 / TLS",
        title: "TLS証明書・暗号化構成",
        detail:
          "期限切れ間近の証明書や中間証明書の不備、ブラウザの「保護されていない通信」警告によって、初見の取引先や患者様が離脱するリスクを早期に把握します。",
        boundary:
          "通常のTLSハンドシェイクで公開提示される証明書情報のみを参照します。負荷をかける連続スキャンは行いません。",
      },
      {
        code: "03 / DNS",
        title: "DNSメール認証レコード",
        detail:
          "自社ドメインになりすました詐欺メールの防止に加え、見積書・請求書・予約確認メールが相手先の迷惑メールフォルダに入るトラブルを防ぎます。",
        boundary:
          "公開DNSレコード（TXT/MX等）の照会のみを行います。メールサーバーへの接続や送信テストは行いません。",
      },
      {
        code: "04 / EXPOSURE",
        title: "公開露出ファイルの有無",
        detail:
          "制作・保守時のバックアップファイルや設定ファイルが誤って公開領域に残っていないかを確認し、情報漏洩の芽を事前に摘み取ります。",
        boundary:
          "代表的な公開パスに対する単発の非侵入確認のみを実施し、脆弱性攻撃ツールやフォーム送信は一切使用しません。",
      },
    ],
    team: {
      sectionNumber: "04",
      kicker: "OUR TEAM · 3名直営体制",
      title: "ヒアリングからセキュリティ診断・実装まで担う3名の直営チーム",
      subtitle:
        "営業担当から下請けへ丸投げするのではなく、窓口・セキュリティ・業務開発それぞれの実務責任者が直接連携し、日本語で分かりやすく伴走します。",
      nameLabel: "担当氏名",
      languagesLabel: "対応言語",
      focusLabel: "主な担当領域",
      members: [
        {
          index: "01",
          code: "CLIENT ADVISORY & DELIVERY",
          name: "佐藤 健一",
          title: "日本国内窓口・要件定義・進行管理リード",
          languages: "日本語 / English",
          summary:
            "初回のご相談窓口として業務背景や稟議要件を丁寧に整理し、御見積書・NDA・検収書類の調整から導入後の運用定着まで伴走します。",
          deliverables: ["日本語による業務ヒアリング", "御見積・前提条件の明文化", "正式PDF書類の発行管理"],
          alt: "日本国内窓口および要件定義リードのスタジオポートレート",
        },
        {
          index: "02",
          code: "SECURITY & INFRASTRUCTURE",
          name: "高橋 直人",
          title: "セキュリティ診断・インフラ・認証設計リード",
          languages: "日本語 / English",
          summary:
            "非侵入型の公開シグナル点検、HTTPS/TLS構成、SPF・DKIM・DMARCによるメール到達性改善、アクセス制御と運用安全性設計を担当します。",
          deliverables: ["非侵入型サイト健康診断", "DNSメール認証（SPF/DKIM/DMARC）", "TLS・公開ヘッダー安全性整備"],
          alt: "セキュリティ診断およびインフラ設計リードのスタジオポートレート",
        },
        {
          index: "03",
          code: "WEB, SYSTEMS & AI ENGINEERING",
          name: "小林 美咲",
          title: "Web構築・業務システム刷新・AI実装リード",
          languages: "日本語 / English",
          summary:
            "初めてのコーポレートサイト構築から、属人化したExcel・Access・旧PHPのWebシステム刷新、実務向けAIワークフロー統合まで設計・実装します。",
          deliverables: ["法人Webサイト新規・刷新構築", "脱Excel・Access・旧PHP Web移行", "保守性の高いAI/業務基盤実装"],
          alt: "Web構築および業務システム刷新リードのスタジオポートレート",
        },
      ],
    },
    governance: {
      sectionNumber: "04",
      label: "法人・医院の稟議・経理処理に必要な正式PDF書類に対応",
      title: "国内窓口・3名直営体制と商習慣対応",
      subtitle:
        "誰が設計し、誰が責任を持つのかが曖昧な外注構造を避け、初期相談から実装・納品書類の発行まで3名体制で一貫対応します。",
      teamTitle: "3名体制の役割分担（日本国内窓口）",
      teamBody:
        "お問い合わせいただいた内容を営業担当から下請けへ流すのではなく、セキュリティ・設計・AI/Web実装を担うメンバーが直接ヒアリングと技術判断を行います。日本国内の窓口として日本語での丁寧なやり取りを基本としつつ、英語での技術調整にも対応可能です。",
      roles: [
        {
          index: "01",
          role: "日本国内窓口・要件整理・顧客対応",
          scope: "日本語での初回相談、業務フローの聞き取り、お見積り・事務書類調整、導入後の伴走。",
        },
        {
          index: "02",
          role: "セキュリティ・インフラ・診断設計",
          scope: "非侵入型の公開シグナル診断、TLS・DNSメール認証整備、アクセス制御と運用安全性確認。",
        },
        {
          index: "03",
          role: "Web・業務システム・AI開発実務",
          scope: "コーポレートサイト構築、脱Excel/Access/旧PHPのWebアプリ開発、AI活用ワークフロー設計。",
        },
      ],
      documentsTitle: "法人・医院の稟議・経理処理に必要な正式PDF書類に対応",
      documentsSubtitle:
        "発注前の秘密保持から検収完了まで、日本のB2B取引で求められる書面一式をPDF形式で速やかに発行します。",
      documents: [
        {
          code: "DOC 01",
          name: "秘密保持契約書（NDA）",
          format: "PDF / 電子確認対応",
          note: "業務資料や既存システムの仕様を共有いただく前の締結に対応します。",
        },
        {
          code: "DOC 02",
          name: "御見積書",
          format: "PDF（明細記載）",
          note: "作業範囲・前提条件・除外事項を明記した上で事前にご提示します。",
        },
        {
          code: "DOC 03",
          name: "請求書",
          format: "PDF · T-128401093215",
          note: "御社・貴院の締日や支払条件に合わせた請求書を発行します。",
        },
        {
          code: "DOC 04",
          name: "検収書・完了報告書",
          format: "PDF",
          note: "納品内容の確認および検収手続きに必要な書面をご提出します。",
        },
      ],
      approverTitle: "上長・院長・代表者様への社内共有用サマリー",
      approverBody:
        "「まずは社内で相談してから問い合わせたい」という場合にお使いいただけます。以下のボタンを押すと、MIRAI Labの概要・非侵入診断の前提・書類対応可否をまとめた共有テキストをクリップボードへコピーできます。",
      copyBriefLabel: "社内共有・稟議用サマリーをコピー",
      copiedBriefLabel: "コピーしました（メールやチャットへ貼付できます）",
    },
    insights: {
      sectionNumber: "05",
      kicker: "技術ブログ・実務ノート",
      title: "現場の判断に役立つ実務ブログ",
      allLabel: "ブログ記事一覧を見る",
      readLabel: "この記事を読む",
      articles: [
        {
          category: "サイト診断・セキュリティ",
          published: "Tech Note 01",
          reading: "約4分で読了",
          title: "ログインも攻撃もしない「非侵入型サイト診断」で何がどこまで分かるのか",
          summary:
            "中小企業や医院のサイト診断で「業務に悪影響が出ないか」と不安を感じる担当者様向けに、公開HTTPヘッダー・TLS・DNS・公開露出ファイルのみから読み取れる実務上のリスクを整理します。",
        },
        {
          category: "業務システム刷新",
          published: "Tech Note 02",
          reading: "約5分で読了",
          title: "属人化したExcel・Access・旧PHP業務を止めずにWebシステムへ移行する実践手順",
          summary:
            "一度に全てを作り替えるのではなく、現場の業務フローと入力ルールを棚卸ししながら、安全にWebシステムへ置き換えるための現実的なステップを解説します。",
        },
        {
          category: "サイト診断・セキュリティ",
          published: "Tech Note 03",
          reading: "約4分で読了",
          title: "取引先や患者様にメールが届かない？SPF・DKIM・DMARCの基礎と確認方法",
          summary:
            "請求書PDFや予約確認メールが相手先でブロックされる背景には、DNSメール認証の不備が多く見られます。サイト本体と同様に重要なDNS設定のポイントをまとめました。",
        },
        {
          category: "Web構築・運用",
          published: "Tech Note 04",
          reading: "約3分で読了",
          title: "ホームページを持たない事業者が「最初の公式Webサイト」を作る際に押さえるべき5点",
          summary:
            "紹介中心のビジネスでも、取引先・銀行・採用候補者は社名を検索します。過度な装飾や高額な月額保守を避け、信頼される最初のWebサイトを整えるための指針です。",
        },
      ],
    },
  },
  en: {
    facts: [
      { label: "Team Structure", value: "3-Person Direct Delivery · Japan Contact" },
      { label: "Health Check", value: "Public Signals Only · Strictly Non-Intrusive" },
      { label: "Core Scope", value: "Websites & Excel / Access / Legacy PHP" },
      { label: "Formal Paperwork", value: "NDA, Quote, Invoice & Acceptance PDFs" },
    ],
    sectors: {
      sectionNumber: "01",
      title: "Who We Serve Across Japan",
      subtitle:
        "Select your sector to see how our non-intrusive diagnostics, first-time website builds, or legacy system migrations align with your operational realities.",
      painLabel: "Common Operational Friction",
      focusLabel: "MIRAI Lab Technical Focus",
      signalsLabel: "Priority Public Signals Reviewed",
    },
    health: {
      index: "03. Free Website Security Health Check",
      title: "Strictly non-intrusive inspection of publicly visible signals only",
      lead: "Understand how your domain and public website appear from the outside without risking downtime or interference. We never log in, run exploit scans, or submit your contact forms.",
      guaranteeTitle: "Strict Non-Intrusive Boundaries",
      guaranteePoints: [
        "Inspects publicly visible signals only: HTTP response headers, TLS certificates, DNS email-authentication records, and publicly exposed files.",
        "Never attempts logins, credential guessing, brute-force checks, or intrusive vulnerability attacks.",
        "Never submits forms or alters production state—zero disruption to daily clinic or office operations.",
      ],
      boundaryLabel: "Non-Intrusive Scope Boundary",
      cta: "Request Free Health Check",
      imageAlt: "Optical glass prisms refracting clean light beams representing transparent non-intrusive inspection",
    },
    signals: [
      {
        code: "01 / HTTP",
        title: "HTTP Response Headers",
        detail:
          "Checks whether public server responses instruct modern browsers to enforce HTTPS and prevent clickjacking or unintended content sniffing.",
        boundary: "Reads only standard public GET response headers; never attempts logins or parameter tampering.",
      },
      {
        code: "02 / TLS",
        title: "TLS Certificate & Transport",
        detail:
          "Detects upcoming certificate expirations, broken intermediate chains, or missing HTTPS redirects that trigger browser warnings for first-time visitors.",
        boundary: "Inspects only the public certificate presented during a standard TLS handshake without stress or port scanning.",
      },
      {
        code: "03 / DNS",
        title: "DNS Email Authentication",
        detail:
          "Prevents domain spoofing and ensures estimates, invoices, and appointment confirmations reach recipients instead of spam folders.",
        boundary: "Queries public DNS records only; never connects to mail servers or sends test emails.",
      },
      {
        code: "04 / EXPOSURE",
        title: "Publicly Exposed Files",
        detail:
          "Verifies that leftover configuration files, repository metadata, or backup archives are not inadvertently accessible on public URLs.",
        boundary: "Performs minimal, non-intrusive checks on standard public paths; never uses exploit payloads or submits forms.",
      },
    ],
    team: {
      sectionNumber: "04",
      kicker: "OUR TEAM · 3-PERSON STRUCTURE",
      title: "Three practitioners working directly with your business in Japan",
      subtitle:
        "No layers of sales brokers or anonymous outsourcing. Advisory scoping, non-intrusive security inspection, and system engineering work side by side under a single Japan-based contact.",
      nameLabel: "Member",
      languagesLabel: "Languages",
      focusLabel: "Core Responsibilities",
      members: [
        {
          index: "01",
          code: "CLIENT ADVISORY & DELIVERY",
          name: "Kenichi Sato",
          title: "Japan-Based Client Contact & Scoping Lead",
          languages: "Japanese / English",
          summary:
            "Serves as your primary Japan-based contact—translating operational realities into clear written scope, itemized PDF quotes, NDAs, and handover coordination.",
          deliverables: ["Direct Japanese consultation", "Clear scope & approval briefs", "NDA, quote & invoice coordination"],
          alt: "Editorial portrait of client advisory and scoping lead in Tokyo office",
        },
        {
          index: "02",
          code: "SECURITY & INFRASTRUCTURE",
          name: "Naoto Takahashi",
          title: "Security & Public-Signal Diagnostics Lead",
          languages: "Japanese / English",
          summary:
            "Conducts strictly non-intrusive HTTP, TLS, DNS email-authentication (SPF/DKIM/DMARC), and exposed-file diagnostics alongside server hardening.",
          deliverables: ["Non-intrusive site health checks", "SPF / DKIM / DMARC mail posture", "TLS & response header hygiene"],
          alt: "Editorial portrait of security and infrastructure lead in Tokyo studio",
        },
        {
          index: "03",
          code: "WEB, SYSTEMS & AI ENGINEERING",
          name: "Misaki Kobayashi",
          title: "Web, System Modernization & AI Engineering Lead",
          languages: "Japanese / English",
          summary:
            "Builds first-time corporate sites, modernizes fragile Excel/Access/legacy PHP workflows into maintainable web apps, and implements practical AI tooling.",
          deliverables: ["Corporate website engineering", "Excel / Access / PHP migrations", "Maintainable AI & web systems"],
          alt: "Editorial portrait of web and system modernization engineering lead in Tokyo studio",
        },
      ],
    },
    governance: {
      sectionNumber: "04",
      label: "Standard Japanese B2B Documentation (PDF)",
      title: "Direct Accountability & Japanese B2B Paperwork",
      subtitle:
        "No layers of account managers or anonymous outsourcing. Three senior practitioners handle technical discovery, security hygiene, implementation, and formal documentation directly.",
      teamTitle: "Three-Person Japan-First Structure",
      teamBody:
        "Your point of contact in Japan communicates directly in natural Japanese (and English when needed), backed immediately by engineering, security, and AI/web execution.",
      roles: [
        {
          index: "01",
          role: "Japan-Based Client Contact & Scoping",
          scope: "Direct Japanese-language consultation, workflow discovery, formal quotations, and ongoing coordination.",
        },
        {
          index: "02",
          role: "Security & Public-Signal Inspection",
          scope: "Non-intrusive HTTP/TLS/DNS checks, email authentication guidance, and system hardening.",
        },
        {
          index: "03",
          role: "Web, System Modernization & AI Engineering",
          scope: "Corporate website engineering, Excel/Access/legacy PHP migrations, and practical AI integrations.",
        },
      ],
      documentsTitle: "Standard Japanese B2B Documentation (PDF)",
      documentsSubtitle:
        "Prepared cleanly for corporate procurement, clinic administration, and accounting workflows.",
      documents: [
        {
          code: "DOC 01",
          name: "Non-Disclosure Agreement (NDA)",
          format: "PDF",
          note: "Available prior to sharing internal spreadsheets, Access schemas, or operational details.",
        },
        {
          code: "DOC 02",
          name: "Written Quote (御見積書)",
          format: "PDF (Itemized)",
          note: "Clear scope boundaries, assumptions, and deliverables stated before any commitment.",
        },
        {
          code: "DOC 03",
          name: "Invoice (請求書)",
          format: "PDF · T-128401093215",
          note: "Issued according to your company closing and payment schedule.",
        },
        {
          code: "DOC 04",
          name: "Acceptance Certificate (検収書)",
          format: "PDF",
          note: "Formal completion and acceptance record issued upon delivery verification.",
        },
      ],
      approverTitle: "Share Internally With an Executive or Approver",
      approverBody:
        "Need approval from a president, clinic director, or headquarters before booking a call? Copy a concise, factual summary formatted for email, Slack, or LINE.",
      copyBriefLabel: "Copy Executive Approval Brief",
      copiedBriefLabel: "Copied brief to clipboard",
    },
    insights: {
      sectionNumber: "05",
      kicker: "ENGINEERING BLOG",
      title: "Practical Engineering & Security Blog",
      allLabel: "View all blog posts",
      readLabel: "Read note",
      articles: [
        {
          category: "Security & Diagnostics",
          published: "Tech Note 01",
          reading: "4 min read",
          title: "What a Strictly Non-Intrusive Website Health Check Reveals Without Touching Production",
          summary:
            "For cautious SMB owners and clinic directors: how public HTTP headers, TLS certificates, DNS records, and exposed file checks surface real risks with zero operational disruption.",
        },
        {
          category: "System Modernization",
          published: "Tech Note 02",
          reading: "5 min read",
          title: "Migrating Fragile Spreadsheets, Access Files, and Legacy PHP Without Halting Operations",
          summary:
            "A practical, low-risk path for Japanese manufacturers, wholesalers, and repair shops moving off brittle spreadsheets, Access files, and unsupported PHP.",
        },
        {
          category: "Security & Diagnostics",
          published: "Tech Note 03",
          reading: "4 min read",
          title: "Why Client Emails Land in Spam: Practical SPF, DKIM, and DMARC Hygiene for Japanese SMBs",
          summary:
            "How missing or misconfigured public DNS authentication records affect invoice delivery, appointment reminders, and brand trust—especially for clinics and advisors.",
        },
        {
          category: "Web Architecture",
          published: "Tech Note 04",
          reading: "3 min read",
          title: "Five Essentials When Building Your Very First Corporate Website in Japan",
          summary:
            "Even referral-driven businesses are searched online by banks, partners, and applicants. How to launch a clear, credible first site without unnecessary complexity.",
        },
      ],
    },
  },
} as const;

const sectors = [
  {
    label: { ja: "税理士・社労士事務所", en: "Tax & Labor Consultants" },
    pain: {
      ja: "顧問先とのメール不達や、古い事務所サイトのまま更新が止まっていることによる信用面の不安。",
      en: "Client email deliverability issues and outdated websites undermining trust with prospective corporate clients.",
    },
    focus: {
      ja: "SPF/DKIM/DMARCの公開DNS確認と、TLS・問い合わせ導線の明確化を最優先で確認します。",
      en: "Prioritize public DNS email authentication (SPF/DKIM/DMARC), TLS posture, and clear consultation intake.",
    },
    signals: ["SPF", "DKIM", "DMARC", "TLS"],
  },
  {
    label: { ja: "クリニック・医院", en: "Clinics & Medical Practices" },
    pain: {
      ja: "患者様の多くがスマートフォンから閲覧する中、表示崩れや「保護されていない通信」警告が来院前の不安につながる。",
      en: "Patients browsing on smartphones encounter broken mobile layouts or browser security warnings before booking.",
    },
    focus: {
      ja: "スマホ実機での閲覧性とHTTPS/TLS証明書、旧式設定ファイルの公開有無を非侵入で確認します。",
      en: "Inspect HTTPS/TLS certificates, mobile ergonomics, and unintended public file exposure non-intrusively.",
    },
    signals: ["TLS", "HTTP", "EXPOSURE"],
  },
  {
    label: { ja: "自動車整備工場", en: "Automotive Repair Shops" },
    pain: {
      ja: "車検・整備予約や車両管理が紙・Excel・Accessに依存し、Webからの新規問い合わせ導線も弱い。",
      en: "Inspection scheduling and customer history rely on paper/Excel/Access, while web inquiry paths remain unclear.",
    },
    focus: {
      ja: "見やすいスマホ対応サイト整備と並行し、顧客・作業台帳のシンプルなWebシステム化を整理します。",
      en: "Combine a clear mobile-first site with a practical transition away from fragile Access/Excel ledgers.",
    },
    signals: ["TLS", "EXPOSURE", "HTTP"],
  },
  {
    label: { ja: "中小製造業・卸売業", en: "Small Manufacturers & Wholesalers" },
    pain: {
      ja: "受発注や在庫管理のExcel・旧PHPシステムが属人化し、取引先企業からのセキュリティ確認にも対応しづらい。",
      en: "Order/inventory Excel sheets and legacy PHP tools are fragile, while enterprise buyers expect verifiable web hygiene.",
    },
    focus: {
      ja: "既存Web・PHP環境の公開露出リスク点検と、段階的な業務システム刷新（脱Excel/Access/旧PHP）を提案します。",
      en: "Check legacy public exposure signals and plan a staged migration from Excel/Access/legacy PHP.",
    },
    signals: ["EXPOSURE", "HTTP", "DNS"],
  },
  {
    label: { ja: "外資系・外国籍経営の中小企業", en: "Foreign-Owned SMBs in Japan" },
    pain: {
      ja: "日本の商習慣（NDA・御見積書・検収書）と日本語品質を満たしたWeb・IT窓口を国内で見つけにくい。",
      en: "Difficulty finding an engineering partner in Japan who handles both natural Japanese B2B quality and formal PDF paperwork.",
    },
    focus: {
      ja: "日本国内窓口・日英両言語での技術コミュニケーションと、日本の商習慣に沿った正式書類発行で支援します。",
      en: "Japan-based bilingual engineering/security point of contact with standard NDA, quote, invoice, and acceptance PDFs.",
    },
    signals: ["HTTP", "TLS", "DNS"],
  },
  {
    label: { ja: "Webサイト未保有の事業者", en: "Businesses Without a Website Yet" },
    pain: {
      ja: "紹介や電話中心でやってきたが、新規取引先・金融機関・採用候補者から会社名検索された際の公式情報がない。",
      en: "Relying on referrals and phone calls, with no official web presence when banks, partners, or recruits search your name.",
    },
    focus: {
      ja: "過剰な機能や高額な保守契約を排し、信頼される最初のコーポレートサイトを明快な構成で新規構築します。",
      en: "Launch your first credible corporate website cleanly—focused on clarity, mobile speed, and formal trust without bloat.",
    },
    signals: ["TLS", "DNS"],
  },
] as const;

export function EditorialSections() {
  const { content } = useLanding();
  const copy = editorialCopy[content.locale];
  const [copied, setCopied] = useState(false);

  async function handleCopyBrief() {
    const text = `${copy.governance.approverTitle}\n${copy.governance.approverBody}\n${
      typeof window === "undefined" ? "" : window.location.href
    }`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setCopied(false);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2600);
  }

  return (
    <>
      <section className="lp-ledger-section" aria-label={copy.facts[0].label}>
        <div className="lp-container">
          <div className="lp-ledger">
            {copy.facts.map((fact, index) => (
              <div className="lp-ledger-cell" key={fact.label}>
                <span className="lp-mono-label">
                  {String(index + 1).padStart(2, "0")} / {fact.label}
                </span>
                <strong>{fact.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sectors" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head-split">
            <div>
              <p className="lp-section-number">
                {copy.sectors.sectionNumber}. {copy.sectors.title}
              </p>
              <h2 className="lp-h2">{copy.sectors.title}</h2>
            </div>
            <p className="lp-lead">{copy.sectors.subtitle}</p>
          </div>
          <div className="lp-sector-grid">
            {sectors.map((sector, index) => (
              <details className="lp-sector-item" key={sector.label.en}>
                <summary>
                  <span className="lp-sector-index">{String(index + 1).padStart(2, "0")}</span>
                  <span>{sector.label[content.locale]}</span>
                  <span aria-hidden="true">→</span>
                </summary>
                <div className="lp-sector-detail">
                  <p className="lp-fact-label">{copy.sectors.painLabel}</p>
                  <p>{sector.pain[content.locale]}</p>
                  <p className="lp-fact-label">{copy.sectors.focusLabel}</p>
                  <p>{sector.focus[content.locale]}</p>
                  <p className="lp-mono-label">{copy.sectors.signalsLabel}</p>
                  <div className="lp-sector-signals">
                    {sector.signals.map((signal) => (
                      <span key={signal}>{signal}</span>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="health-check-overview" className="lp-section lp-section-muted">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head-split">
            <div>
              <p className="lp-section-number">{copy.health.index}</p>
              <h2 className="lp-h2">{copy.health.title}</h2>
            </div>
            <p className="lp-lead">{copy.health.lead}</p>
          </div>
          <div className="lp-health-grid">
            <div className="lp-signal-panel">
              <div className="lp-panel-bar">
                <span>PASSIVE READ-ONLY PREFLIGHT</span>
                <span>{copy.health.boundaryLabel}</span>
              </div>
              <div className="lp-signal-grid">
                {copy.signals.map((signal) => (
                  <div className="lp-signal-cell" key={signal.code}>
                    <span className="lp-mono-label">{signal.code}</span>
                    <h3>{signal.title}</h3>
                    <p>{signal.detail}</p>
                    <p className="lp-signal-boundary">{signal.boundary}</p>
                  </div>
                ))}
              </div>
            </div>
            <aside className="lp-boundary-panel">
              <p className="lp-mono-label">{copy.health.guaranteeTitle}</p>
              <ul>
                {copy.health.guaranteePoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link className="lp-btn lp-btn-primary" href="/#contact">
                {copy.health.cta}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section id="team" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head-split">
            <div>
              <p className="lp-section-number">
                {copy.team.sectionNumber}. {copy.team.kicker}
              </p>
              <h2 className="lp-h2">{copy.team.title}</h2>
            </div>
            <p className="lp-lead">{copy.team.subtitle}</p>
          </div>
          <div className="lp-team-grid">
            {copy.team.members.map((member, index) => (
              <article className="lp-team-card" key={member.code}>
                <div className="lp-team-photo">
                  <Image
                    src={teamImages[index] ?? teamImages[0]}
                    alt={member.alt}
                    width={640}
                    height={800}
                    unoptimized
                  />
                  <span className="lp-team-code">
                    <span>{member.index}</span>
                    <span>{member.code}</span>
                  </span>
                </div>
                <div className="lp-team-body">
                  <dl className="lp-team-meta">
                    <div>
                      <dt>{copy.team.nameLabel}</dt>
                      <dd>{member.name}</dd>
                    </div>
                    <div>
                      <dt>{copy.team.languagesLabel}</dt>
                      <dd>{member.languages}</dd>
                    </div>
                  </dl>
                  <h3 className="lp-h3">{member.title}</h3>
                  <p>{member.summary}</p>
                  <p className="lp-fact-label">{copy.team.focusLabel}</p>
                  <ul>
                    {member.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="governance" className="lp-section lp-dark-panel lp-governance">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head-split">
            <div>
              <p className="lp-kicker">
                {copy.governance.sectionNumber}. {copy.governance.label}
              </p>
              <h2 className="lp-h2">{copy.governance.title}</h2>
            </div>
            <p className="lp-lead">{copy.governance.subtitle}</p>
          </div>
          <div className="lp-governance-grid">
            <div className="lp-governance-roles">
              <h3 className="lp-h3">{copy.governance.teamTitle}</h3>
              <p>{copy.governance.teamBody}</p>
              <dl>
                {copy.governance.roles.map((role) => (
                  <div key={role.index}>
                    <dt>
                      <span>{role.index}</span>
                      {role.role}
                    </dt>
                    <dd>{role.scope}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lp-document-panel">
              <h3 className="lp-h3">{copy.governance.documentsTitle}</h3>
              <p>{copy.governance.documentsSubtitle}</p>
              <div className="lp-document-grid">
                {copy.governance.documents.map((doc) => (
                  <div className="lp-document-card" key={doc.code}>
                    <span className="lp-mono-label">{doc.code}</span>
                    <strong>{doc.name}</strong>
                    <span className="lp-document-format">{doc.format}</span>
                    <p>{doc.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lp-approver-panel">
            <div>
              <p className="lp-mono-label">INTERNAL APPROVAL SUPPORT</p>
              <h3 className="lp-h3">{copy.governance.approverTitle}</h3>
              <p>{copy.governance.approverBody}</p>
            </div>
            <button type="button" className="lp-btn lp-btn-primary" onClick={handleCopyBrief}>
              {copied ? copy.governance.copiedBriefLabel : copy.governance.copyBriefLabel}
            </button>
          </div>
        </div>
      </section>

      <section id="insights-preview" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head lp-insight-head">
            <div>
              <p className="lp-section-number">
                {copy.insights.sectionNumber}. {copy.insights.kicker}
              </p>
              <h2 className="lp-h2">{copy.insights.title}</h2>
            </div>
            <Link className="lp-text-link" href="/blog">
              {copy.insights.allLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="lp-insight-grid">
            {copy.insights.articles.map((article) => (
              <article className="lp-insight-card" key={article.published}>
                <div className="lp-insight-meta">
                  <span>{article.category}</span>
                  <span className="lp-mono-label">{article.published}</span>
                  <span>{article.reading}</span>
                </div>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <Link className="lp-text-link" href="/blog">
                  {copy.insights.readLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
