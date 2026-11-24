import { t } from "@/content/site";
import type { MergedSiteContent } from "@/lib/settings";
import type { LegalDocument, LegalSlug, Locale } from "../types";

export function legalContent(locale: Locale, site: MergedSiteContent): Record<LegalSlug, LegalDocument> {
  const ja = locale === "ja";
  const legalName = "MIRAI Lab";
  const phone = site.contact.phone;
  const email = t(site.contact.email, locale);
  const address = t(site.contact.address, locale);
  const representative = t(site.about.authorName, locale);
  const hours = ja ? "平日 9:00〜18:00" : "Weekdays 9:00–18:00";
  const serviceArea = ja
    ? "日本全国（オンライン中心）・東京都中央区"
    : "Japan-wide remote support, Chuo-ku Tokyo";
  const policyDate = ja ? "2026年11月24日" : "November 24, 2026";
  const jurisdiction = ja ? "東京地方裁判所" : "Tokyo District Court";
  const priceWebsite = site.pricing[0]?.price ?? "￥29,800";
  const priceSystem = site.pricing[1]?.price ?? "￥98,000–￥198,000";
  const priceRetainer = site.pricing[2]?.price ?? "￥30,000 / ￥60,000 / ￥100,000–￥150,000";

  return {
    privacy: {
      slug: "privacy",
      eyebrow: "PRIVACY POLICY",
      title: ja ? "プライバシーポリシー" : "Privacy Policy",
      description: ja
        ? `${legalName}における個人情報の取得目的、利用範囲、安全管理措置およびお問い合わせ窓口について定めています。`
        : "How MIRAI Lab collects, uses, protects, and handles inquiries about personal information.",
      lead: ja
        ? `${legalName}（以下「当社」といいます）は、無料サイト診断、Web制作、業務システムのご提供にあたり、お預かりする情報を適切に取り扱います。`
        : `${legalName} ("we" or "us") handles information responsibly when providing website health checks, web builds, and business system services.`,
      updatedLabel: ja ? "最終改定日" : "Last updated",
      updatedValue: policyDate,
      sections: [
        {
          number: "01",
          heading: ja ? "取得する情報" : "Information We Collect",
          paragraphs: [
            ja
              ? "お問い合わせフォームにご入力いただいた情報と、無料サイト診断のために対象サイトへアクセスして得られる公開情報のみを取り扱います。"
              : "We handle only the information you enter in the contact form and publicly visible information obtained when checking a target site for a free health check.",
            ja
              ? "お電話やメールでご相談いただいた場合は、やり取りに必要な範囲でご連絡先とご相談内容をお預かりします。"
              : "If you contact us by phone or email, we receive the contact details and inquiry content needed to continue the conversation.",
          ],
          bullets: [
            ja
              ? "会社名・屋号、ご担当者名、メールアドレス、電話番号"
              : "Company or organization name, contact name, email address, and phone number",
            ja
              ? "対象サイトのURL、ご相談内容、ご希望の納期やご予算"
              : "Target website URL, inquiry details, preferred schedule, and budget",
            ja
              ? "HTTP応答ヘッダ、TLS証明書、DNSメール認証記録、公開ファイルの状態に関する公開情報"
              : "Public information about HTTP response headers, TLS certificates, DNS email-authentication records, and publicly exposed files",
            ja
              ? "診断対象サイトから個人名・メールアドレス・電話番号などの個人データを抽出し、保存することはありません。"
              : "We do not extract or store personal names, email addresses, phone numbers, or other personal data from scanned websites.",
          ],
        },
        {
          number: "02",
          heading: ja ? "利用目的" : "How We Use Information",
          paragraphs: [
            ja
              ? "取得した情報は、以下の目的の範囲内で利用いたします。"
              : "We use the information only for the purposes below.",
          ],
          bullets: [
            ja
              ? "ご相談への回答、無料サイト診断結果のご報告、お見積り・ご提案書の作成"
              : "Answering inquiries, reporting health check results, and preparing quotes and proposals",
            ja
              ? "NDA・御見積書・請求書・検収書（PDF）の発行および業務上の連絡"
              : "Issuing PDF NDAs, quotes, invoices, and acceptance documents, and handling related correspondence",
            ja
              ? "サービスの品質向上およびスパム等、不正送信の防止"
              : "Improving service quality and preventing spam or other unauthorized submissions",
          ],
        },
        {
          number: "03",
          heading: ja ? "第三者提供と安全管理措置" : "Third-Party Sharing and Safeguards",
          paragraphs: [
            ja
              ? "法令に基づく場合を除き、ご本人の同意なく個人情報を第三者へ提供いたしません。"
              : "We do not disclose personal information to third parties without consent, except where required by law.",
            ja
              ? "お預かりした情報へのアクセス権限を限定し、漏えい・滅失・毀損の防止に努めます。"
              : "Access is limited to those who need it, and we take reasonable steps to prevent loss, disclosure, and damage.",
          ],
        },
        {
          number: "04",
          heading: ja ? "保管期間と削除" : "Retention and Deletion",
          paragraphs: [
            ja
              ? "情報は、利用目的に必要な期間のみ保管し、不要になった時点で適切に削除いたします。"
              : "We retain information only as long as needed for the stated purposes and delete it when it is no longer necessary.",
            ja
              ? "削除をご希望の場合は、下記の窓口までご連絡ください。ご本人確認のうえ対応いたします。"
              : "To request deletion, please contact us below. We will verify your identity before responding.",
          ],
        },
        {
          number: "05",
          heading: ja ? "開示・訂正のご請求とお問い合わせ" : "Access, Correction, and Contact",
          paragraphs: [
            ja
              ? "ご本人からの開示、訂正、利用停止等のご希望には、ご本人確認のうえ速やかに対応いたします。"
              : "We respond promptly to requests for access, correction, or suspension of use after verifying identity.",
            ja
              ? `お問い合わせ先：${legalName}（所在地：${address}／メール：${email}／電話：${phone}）`
              : `Contact: ${legalName} (Address: ${address} / Email: ${email} / Phone: ${phone})`,
          ],
        },
      ],
      ctaTitle: ja ? "個人情報の取り扱いに関するご質問" : "Questions About Personal Information",
      ctaBody: ja
        ? "データの範囲やNDA締結についてご不明な点がありましたら、お問い合わせフォームよりお知らせください。"
        : "If you have questions about the data we handle or need an NDA, please use the contact form.",
    },

    terms: {
      slug: "terms",
      eyebrow: "TERMS OF SERVICE",
      title: ja ? "利用規約" : "Terms of Service",
      description: ja
        ? `${legalName}のWebサイト、無料サイト診断、各種ご相談サービスのご利用条件を定めています。`
        : "Conditions for using the MIRAI Lab website, free website health checks, and related services.",
      lead: ja
        ? `本規約は、${legalName}（以下「当社」といいます）が運営するWebサイトおよび関連サービスのご利用に関する条件を定めるものです。`
        : `These terms govern use of the website and related services operated by ${legalName} ("we" or "us").`,
      updatedLabel: ja ? "制定・改定日" : "Effective date",
      updatedValue: policyDate,
      sections: [
        {
          number: "01",
          heading: ja ? "適用範囲" : "Scope",
          paragraphs: [
            ja
              ? "本規約は、当サイトの閲覧者および無料相談・無料サイト診断をお申し込みいただくお客様に適用します。制作・システム開発などの個別契約では、別途お見積書や契約書、NDAの定めが優先します。"
              : "These terms apply to visitors and customers who request a free consultation or health check. For individual build or development engagements, the separate quote, agreement, and NDA take precedence.",
          ],
        },
        {
          number: "02",
          heading: ja ? "サービスの内容と診断の範囲" : "Services and Diagnostic Scope",
          paragraphs: [
            ja
              ? "無料サイト診断は、HTTP応答ヘッダ、TLS証明書、DNSメール認証設定、公開ファイルなど、外部から閲覧可能な公開情報のみを確認する非侵入型の一次確認です。ログイン、攻撃、フォーム送信は行いません。"
              : "The free health check is a passive first review of publicly visible information: HTTP response headers, TLS certificates, DNS email-authentication settings, and public files. We do not log in, attack, or submit forms.",
            ja
              ? "診断は、対象ドメインの正当な管理者またはその許諾を得た方からのご依頼に限りお受けします。"
              : "Checks are accepted only from the legitimate administrator of the target domain or an authorized representative.",
          ],
        },
        {
          number: "03",
          heading: ja ? "料金とお支払い" : "Fees and Payment",
          paragraphs: [
            ja
              ? `無料サイト診断は0円です。ホームページ制作・刷新は${priceWebsite}、業務システム刷新は${priceSystem}、保守・伴走は${priceRetainer}を目安としています。個別の範囲はPDFのお見積書に記載します。`
              : `The free website health check costs nothing. Guide prices are ${priceWebsite} for website build and renewal, ${priceSystem} for system modernization, and ${priceRetainer} for maintenance and support. Individual scope is set out in a written PDF quote.`,
            ja
              ? "お支払い方法と支払期限は、お見積書および請求書に記載します。ご要望がある場合は事前にご相談ください。"
              : "Payment methods and due dates are stated in the quote and invoice. Please raise any requirements in advance.",
          ],
        },
        {
          number: "04",
          heading: ja ? "禁止事項" : "Prohibited Use",
          paragraphs: [
            ja ? "当サイトのご利用にあたり、以下の行為はご遠慮ください。" : "Please avoid the following when using this site.",
          ],
          bullets: [
            ja
              ? "虚偽の情報または第三者になりすましたお問い合わせ送信"
              : "Submitting false information or inquiries while impersonating another party",
            ja
              ? "不正アクセス、過度な自動送信、スクレイピング等、運営を妨害する行為"
              : "Unauthorized access, excessive automated submissions, scraping, or other disruptive activity",
            ja
              ? "他者の管理権限に属するサイトを対象とした無断の診断依頼"
              : "Requesting checks on sites you do not administer or have permission to assess",
          ],
        },
        {
          number: "05",
          heading: ja ? "免責事項・準拠法・管轄" : "Disclaimer, Governing Law, and Jurisdiction",
          paragraphs: [
            ja
              ? "公開情報のみを対象とする無料サイト診断は、脆弱性が一切存在しないことを断定するものではありません。詳細な確認が必要な場合は個別にご相談ください。"
              : "A passive check of public information cannot certify that no vulnerability exists. Please contact us separately if a detailed assessment is required.",
            ja
              ? `本規約は日本法を準拠法とし、紛争が生じた場合は${jurisdiction}を第一審の専属的合意管轄裁判所とします。`
              : `These terms are governed by Japanese law, and ${jurisdiction} has exclusive jurisdiction as the court of first instance for any dispute.`,
          ],
        },
      ],
      ctaTitle: ja ? "ご契約書面に関するご相談" : "Questions About Contract Documents",
      ctaBody: ja
        ? "NDAや個別契約条件の確認が必要な場合は、お気軽にお問い合わせください。"
        : "Please contact us if you need to review an NDA or individual contract terms.",
    },

    tokushoho: {
      slug: "tokushoho",
      eyebrow: "SPECIFIED COMMERCIAL TRANSACTIONS",
      title: ja ? "特定商取引法に基づく表記" : "Specified Commercial Transactions Notice",
      description: ja
        ? `${legalName}の事業者情報、料金、お支払い方法、役務提供時期等を記載しています。`
        : "Business details, fees, payment terms, and service timing for MIRAI Lab.",
      lead: ja
        ? "特定商取引に関する法律に基づき、以下の事項を表記いたします。"
        : "The following information is provided in accordance with the Act on Specified Commercial Transactions.",
      updatedLabel: ja ? "最終更新日" : "Last updated",
      updatedValue: policyDate,
      sections: [
        {
          number: "01",
          heading: ja ? "事業者情報" : "Business Information",
          paragraphs: [
            ja
              ? `事業者名は${legalName}、代表者は${representative}です。所在地は${address}、受付は${hours}、電話番号は${phone}、メールアドレスは${email}です。`
              : `The business name is ${legalName} and the representative is ${representative}. The office is at ${address}. Business hours are ${hours}, with phone ${phone} and email ${email}.`,
          ],
        },
        {
          number: "02",
          heading: ja ? "提供するサービス" : "Services",
          paragraphs: [
            ja
              ? "公開情報のみを確認する無料サイト診断、ホームページ制作・リニューアル、業務システムの改善・刷新を提供しています。"
              : "We provide passive website health checks based on public information, website builds and renewals, and business system modernization.",
          ],
          bullets: [
            ja
              ? "無料サイト診断：HTTPヘッダ、TLS証明書、DNSメール認証、公開ファイルの確認"
              : "Free Website Health Check: HTTP headers, TLS certificates, DNS email authentication, and public files",
            ja
              ? "ホームページ制作・リニューアル：構成設計、実装、問い合わせ導線の整備"
              : "Website Build & Renewal: structure, implementation, and inquiry flows",
            ja
              ? "業務システム刷新：表計算・Access・旧PHPからのWebシステム移行"
              : "System Modernization: migration from spreadsheets, Access, and legacy PHP to web systems",
          ],
        },
        {
          number: "03",
          heading: ja ? "料金および支払い" : "Fees and Payment",
          paragraphs: [
            ja
              ? `無料サイト診断は0円、ホームページ制作・刷新は${priceWebsite}、業務システム刷新は${priceSystem}、保守・伴走は${priceRetainer}を目安としています。いずれも個別のご範囲に応じてPDFのお見積書でご提示します。`
              : `The free health check is Free, website build and renewal starts at ${priceWebsite}, system modernization at ${priceSystem}, and maintenance and support at ${priceRetainer}. Each engagement is quoted individually in writing.`,
            ja
              ? "お支払い方法、支払期限、税の取扱いはお見積書および請求書に記載します。"
              : "Payment method, due date, and tax treatment are stated in the quote and invoice.",
          ],
        },
        {
          number: "04",
          heading: ja ? "提供時期・キャンセル" : "Service Timing and Cancellation",
          paragraphs: [
            ja
              ? "ご契約と仕様の確定後、お見積書に記載したスケジュールに沿って制作・納品いたします。"
              : "After agreement and scope confirmation, work proceeds and is delivered according to the schedule in the quote.",
            ja
              ? "キャンセルや中途解約をご希望の場合は、できるだけ早くご連絡ください。発生済みの作業分についてはお見積書の条件に従います。"
              : "If you wish to cancel or terminate mid-engagement, please contact us as soon as possible. Work already performed is handled under the terms of the quote.",
          ],
        },
      ],
      rows: [
        { label: ja ? "事業者名" : "Business name", value: legalName },
        { label: ja ? "代表者" : "Representative", value: representative },
        { label: ja ? "所在地" : "Address", value: address },
        { label: ja ? "電話番号" : "Phone", value: phone },
        { label: ja ? "メールアドレス" : "Email", value: email },
        { label: ja ? "事業時間" : "Business hours", value: hours },
        { label: ja ? "対応エリア" : "Service area", value: serviceArea },
        {
          label: ja ? "提供サービス" : "Services",
          value: ja
            ? "無料サイト診断、ホームページ制作・リニューアル、業務システムの改善・刷新"
            : "Free Website Health Check, Website Build & Renewal, Business System Modernization",
        },
        {
          label: ja ? "料金" : "Fees",
          value: ja
            ? `無料サイト診断：0円／ホームページ制作・刷新：${priceWebsite}／業務システム刷新：${priceSystem}／保守・伴走：${priceRetainer}（税別・個別案件はPDFのお見積りで提示）`
            : `Free Website Health Check: Free / Website Build & Renewal: ${priceWebsite} / Business System Modernization: ${priceSystem} / Maintenance & Support: ${priceRetainer} (excl. tax; individual scope quoted in PDF)`,
        },
      ],
      ctaTitle: ja ? "書面のご確認について" : "Document Review",
      ctaBody: ja
        ? "社内稟議や経理手続きに必要なPDF書類は、ご相談時にお知らせください。"
        : "Let us know during consultation which PDF documents you need for internal approval or accounting.",
    },

    "security-policy": {
      slug: "security-policy",
      eyebrow: "DIAGNOSTIC & SECURITY POLICY",
      title: ja ? "非侵入型サイト診断・情報セキュリティ方針" : "Passive Website Check & Security Policy",
      description: ja
        ? "無料サイト診断で確認する項目、実施しない操作、取得データの取扱いについて定めています。"
        : "What our free health check reviews, what it never does, and how collected data is handled.",
      lead: ja
        ? "お客様の本番環境や業務に影響を与えることなく現状を把握いただくため、診断の実施範囲と制限事項を明確に定めています。"
        : "We define a strict scope for each check so you can understand your public posture without affecting production systems or daily operations.",
      updatedLabel: ja ? "方針更新日" : "Policy updated",
      updatedValue: policyDate,
      sections: [
        {
          number: "01",
          heading: ja ? "確認対象となる公開情報" : "Public Information We Review",
          paragraphs: [
            ja
              ? "一般的なブラウザから参照できる範囲に限定し、以下の公開設定を確認します。"
              : "We limit review to what an ordinary browser can access and check the following public settings.",
          ],
          bullets: [
            ja
              ? "TLS証明書：有効期限と暗号化設定の基本状況"
              : "TLS certificate: expiry and baseline encryption configuration",
            ja
              ? "HTTP応答ヘッダ：サーバー情報の露出とセキュリティ関連ヘッダの設定"
              : "HTTP response headers: server disclosure and security-related header settings",
            ja
              ? "DNSメール認証記録：SPF、DKIM、DMARCの公開状態"
              : "DNS email-authentication records: published SPF, DKIM, and DMARC status",
            ja
              ? "公開露出ファイル：設定ファイルやバックアップ等の公開有無"
              : "Publicly exposed files: whether configuration or backup files are accessible",
          ],
        },
        {
          number: "02",
          heading: ja ? "実施しない操作" : "What We Never Do",
          paragraphs: [
            ja
              ? "お客様の事業継続とシステムの安全性を守るため、事前の合意なく以下の操作を行うことはありません。"
              : "To protect continuity and system safety, we never perform the following without prior agreement.",
          ],
          bullets: [
            ja
              ? "管理画面や認証画面へのログイン試行、パスワード推測"
              : "Login attempts or password guessing against admin or authentication screens",
            ja
              ? "攻撃コードの送信や、サーバーへ高負荷をかけるスキャン"
              : "Sending attack payloads or running scans that place heavy load on servers",
            ja
              ? "お問い合わせフォームへのテスト送信、データの書き換え"
              : "Test submissions to contact forms or modification of data",
            ja
              ? "診断対象サイトに掲載された個人情報の抽出・保存"
              : "Extracting or storing personal information published on scanned sites",
          ],
        },
        {
          number: "03",
          heading: ja ? "データの最小化と管理" : "Data Minimization and Handling",
          paragraphs: [
            ja
              ? "取得するのは、フォームにご入力いただいたご連絡先とご相談内容、および対象URLに紐づく公開設定の確認結果のみです。"
              : "We collect only the contact details and inquiry content you provide, plus the results of public-setting checks tied to the target URL.",
            ja
              ? "不要になった情報は速やかに削除し、アクセス権限を限定して管理します。"
              : "Unneeded information is deleted promptly, and access is restricted.",
            ja
              ? "より詳細な調査や改修をご希望の場合は、秘密保持契約書（NDA）をPDFで締結いたします。"
              : "For deeper investigation or remediation, we can execute an NDA as a PDF document.",
          ],
        },
        {
          number: "04",
          heading: ja ? "結果のご報告と方針の見直し" : "Reporting and Policy Review",
          paragraphs: [
            ja
              ? "診断結果はPDFレポートとしてお申し込みご本人へ直接ご提示し、外部へ公表いたしません。"
              : "Results are delivered directly to the requester as a PDF report and are not published externally.",
            ja
              ? "確認項目と運用方法は、安全な範囲を維持できるよう定期的に見直します。"
              : "We review the check items and operating practices regularly to keep them safely scoped.",
          ],
        },
      ],
      ctaTitle: ja ? "無料サイト診断のお申し込み" : "Request a Free Website Health Check",
      ctaBody: ja
        ? "対象サイトのURLをお知らせいただければ、公開情報の確認についてご案内いたします。"
        : "Share the target URL and we will explain how the public-information check works.",
    },
  };
}
