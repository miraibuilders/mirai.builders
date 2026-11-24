import { t } from "@/content/site";
import type { MergedSiteContent } from "@/lib/settings";
import type { LandingContent } from "../types";
import { legalContent } from "./legal";

export function jaContent(site: MergedSiteContent): LandingContent {
  const legalName = "MIRAI Lab";
  const phone = site.contact.phone;
  const phoneTel = phone.replace(/[^\d+]/g, "");
  const email = t(site.contact.email, "ja");
  const address = t(site.contact.address, "ja");
  const representative = t(site.about.authorName, "ja");
  const hours = "平日 9:00〜18:00";
  const hoursLabel = "平日";
  const serviceArea = "日本全国（オンライン中心）・東京都中央区";
  const replySla = "1営業日以内";
  const copyrightSource = t(site.footer.copyright, "ja").trim() || legalName;
  const year = site.year.ja;
  const copyright = copyrightSource.includes(year) ? copyrightSource : `${copyrightSource} ${year}`;
  const heroHeadline = t(site.hero.headline, "ja");
  const heroSplitIndex = heroHeadline.indexOf("、");
  const headline = heroSplitIndex >= 0 ? heroHeadline.slice(0, heroSplitIndex + 1) : heroHeadline;
  const headlineAccent = heroSplitIndex >= 0 ? heroHeadline.slice(heroSplitIndex + 1) : "";
  const heroSubheadline = t(site.hero.subheadline, "ja");
  const heroCta = t(site.hero.cta, "ja");
  const heroImage = site.hero.image
    ? { ...site.hero.image, alt: t(site.hero.image.alt, "ja") }
    : null;
  const priceWebsite = site.pricing[0]?.price ?? "￥29,800";
  const priceSystem = site.pricing[1]?.price ?? "￥98,000–￥198,000";
  const priceRetainer = site.pricing[2]?.price ?? "￥30,000 / ￥60,000 / ￥100,000–￥150,000";

  return {
    locale: "ja",
    brand: {
      wordmark: "MIRAI Lab",
      legalName,
      logoAlt: "MIRAI Lab ロゴ",
    },
    a11y: {
      skipLink: "本文へ移動",
      mainNavLabel: "メインメニュー",
      mobileNavLabel: "モバイルメニュー",
      openMenuLabel: "メニューを開く",
      closeMenuLabel: "メニューを閉じる",
      phoneLinkPrefix: "電話をかける",
      footerNavLabel: "フッターメニュー",
    },
    header: {
      nav: [
        { label: "お悩み", href: "/#problems" },
        { label: "サービス", href: "/#services" },
        { label: "料金の目安", href: "/#pricing" },
        { label: "進め方", href: "/#flow" },
        { label: "ブログ", href: "/blog" },
        { label: "会社概要", href: "/#company" },
        { label: "お問い合わせ", href: "/#contact" },
      ],
      phoneDisplay: phone,
      phoneTel,
      hours,
      ctaLabel: "無料相談",
      accountLabel: "ログイン",
      languageLabel: "言語を切り替える",
      jaLabel: "日本語",
      enLabel: "English",
      adminLabel: "管理画面",
    },
    loader: {
      eyebrow: "MIRAI LAB",
      label: "読み込み中…",
      skipLabel: "スキップ",
    },
    stickyBar: {
      callLabel: "電話で相談",
      consultLabel: "無料相談",
    },
    hero: {
      eyebrow: "中小企業のためのWeb・業務支援",
      headline,
      headlineAccent,
      subheadline: heroSubheadline,
      image: heroImage,
      trustChips: [
        "非侵入型の公開情報診断",
        "3名体制・日本語窓口",
        "NDA・見積書・請求書・検収書PDF",
      ],
      primaryCta: heroCta,
      secondaryCta: "料金の目安を見る",
      phoneLabel: "お電話でのご相談",
      sampleCard: {
        badge: "診断レポート例",
        status: "公開情報のみ",
        title: "無料サイト診断レポート",
        caption:
          "表示内容は説明用の例です。対象サイトへログインしたり、攻撃やフォーム送信を行ったりすることはありません。",
        items: [
          {
            label: "HTTPS・TLS証明書",
            status: "確認済み",
            tone: "ok",
            detail: "有効期限と暗号化設定の基本状況を確認します。",
          },
          {
            label: "HTTP応答ヘッダ",
            status: "要確認",
            tone: "warn",
            detail: "サーバー情報の露出や基本的なヘッダ設定を確認します。",
          },
          {
            label: "SPF / DKIM / DMARC",
            status: "確認済み",
            tone: "ok",
            detail: "DNSに公開されたメール認証記録の状態を確認します。",
          },
          {
            label: "公開露出ファイル",
            status: "要確認",
            tone: "warn",
            detail: "意図せず公開された設定ファイルやバックアップの有無を確認します。",
          },
        ],
      },
    },
    problems: {
      eyebrow: "PROBLEMS",
      title: "こんなお悩みはありませんか",
      lead: "現場の実務に直結するWebサイトと業務システムの課題を、公開情報の確認から一緒に整理します。",
      segmentsLabel: "主なご相談対象",
      segments: [
        "税理士・社労士・医院",
        "自動車整備工場",
        "インバウンド観光",
        "小規模製造・卸売",
        "外資系中小企業",
      ],
      items: [
        {
          number: "01",
          segment: "既存サイト",
          title: "スマートフォンで見づらいままのサイト",
          description:
            "数年前に制作したホームページがモバイルに対応しておらず、掲載情報も更新できていません。",
        },
        {
          number: "02",
          segment: "安全性",
          title: "HTTPSや証明書の期限が気になる",
          description:
            "ブラウザに保護されていない通信と表示されたり、証明書の更新状況を把握できていません。",
        },
        {
          number: "03",
          segment: "保守・環境",
          title: "CMSやPHP環境が放置されている",
          description:
            "制作会社と連絡が取れず、古いバージョンのまま運用を続けていて不具合が心配です。",
        },
        {
          number: "04",
          segment: "業務管理",
          title: "Excel・Access中心の属人的な運用",
          description:
            "ファイルの破損や担当者依存が起きており、複数人で安全に使えるWebシステムへ移行したいと考えています。",
        },
        {
          number: "05",
          segment: "新規立ち上げ",
          title: "自社のホームページがまだない",
          description:
            "取引先や来訪者から確認される機会が増えた一方で、何から始めればよいか判断できていません。",
        },
        {
          number: "06",
          segment: "相談体制",
          title: "日本語で気軽に相談できる相手がいない",
          description:
            "海外本社との調整や日々の運用について、実務に即した説明を日本語で受けたいと考えています。",
        },
      ],
    },
    reasons: {
      eyebrow: "REASONS",
      title: "安心してご相談いただける理由",
      items: [
        {
          number: "01",
          title: "公開情報のみを確認する非侵入型診断",
          description:
            "HTTP応答ヘッダ、TLS証明書、DNSのメール認証記録、公開ファイルなど、外部から見える情報だけを確認します。ログイン、攻撃、フォーム送信は一切行いません。",
        },
        {
          number: "02",
          title: "3名体制による直接のご対応",
          description:
            "技術・セキュリティ・AI/Web・お客様対応を3名で分担し、調査からご提案、構築まで担当者間で認識を揃えて進めます。",
        },
        {
          number: "03",
          title: "社内手続きに使いやすいPDF書面",
          description:
            "秘密保持契約書（NDA）、お見積書、請求書、検収書をPDFで発行します。比較検討や社内稟議、経理手続きにそのままご活用いただけます。",
        },
      ],
    },
    services: {
      eyebrow: "SERVICE",
      title: "3つの支援サービス",
      items: [
        {
          number: "01",
          title: "無料サイト診断",
          summary:
            "公開上の設定不備や証明書の期限切れリスクを、外部から確認できる情報だけで整理します。",
          audienceLabel: "対象",
          audience: "既存サイトの公開上の状態を確認したい中小企業・各種事務所様",
          scopeLabel: "対応範囲",
          scope:
            "HTTP応答ヘッダ、TLS証明書、DNSメール認証（SPF/DKIM/DMARC）、公開露出ファイルの確認",
          deliverableLabel: "納品物",
          deliverable: "確認結果と優先して対応すべき事項をまとめたPDFレポート",
          ctaLabel: "無料診断を相談する",
        },
        {
          number: "02",
          title: "ホームページ制作・リニューアル",
          summary:
            "初めてのホームページ開設から、スマートフォン対応と情報設計の見直しまで対応します。",
          audienceLabel: "対象",
          audience: "新規開設または古いサイトからの刷新をご検討の事業者様",
          scopeLabel: "対応範囲",
          scope: "構成設計、スマートフォン対応実装、問い合わせ導線の整備、基本設定",
          deliverableLabel: "納品物",
          deliverable: "公開用Webサイト一式と運用引き継ぎ資料",
          ctaLabel: "制作・刷新を相談する",
        },
        {
          number: "03",
          title: "業務システムの改善・刷新",
          summary:
            "破損や属人化が起きやすい表計算・Access・旧PHP環境を、保守しやすいWebシステムへ段階的に移行します。",
          audienceLabel: "対象",
          audience: "Excel・Access・旧式システムでの管理に限界を感じている企業様",
          scopeLabel: "対応範囲",
          scope: "現行業務の整理、データ構造設計、Webアプリケーション開発・移行",
          deliverableLabel: "納品物",
          deliverable: "Web業務システム一式、操作手順書、検収関連書類",
          ctaLabel: "業務改善を相談する",
        },
      ],
    },
    pricing: {
      eyebrow: "PRICING",
      title: "料金の目安",
      estimateNote: "税別表示・お見積り無料",
      plans: [
        {
          number: "01",
          name: "無料サイト診断",
          price: "0円",
          taxNote: "無料",
          summary: "公開情報のみに基づく一次確認と優先課題の整理",
          items: [
            "HTTP応答ヘッダ・TLS証明書の確認",
            "DNSメール認証設定の確認",
            "公開露出ファイルの確認",
            "PDFレポートと優先対応事項のご提示",
          ],
          recommended: true,
          recommendedLabel: "まずはここから",
        },
        {
          number: "02",
          name: "ホームページ制作・刷新",
          price: priceWebsite,
          taxNote: "税別",
          summary: "初めてのサイト開設やスマートフォン対応リニューアル",
          items: [
            "情報整理と構成のご提案",
            "スマートフォン対応デザインの実装",
            "問い合わせフォームの設置",
            "PDF見積書・請求書の発行",
          ],
        },
        {
          number: "03",
          name: "業務システム刷新",
          price: priceSystem,
          taxNote: "税別",
          summary: "Excel・Access・旧PHPからの段階的なWeb移行",
          items: [
            "現行業務フローの整理",
            "画面・データ構造の設計",
            "段階的な開発と動作確認",
            "検収書PDFの発行と引き継ぎ",
          ],
        },
        {
          number: "04",
          name: "保守・伴走サポート",
          price: priceRetainer,
          taxNote: "税別",
          summary: "公開後の運用相談、改善、定期確認を継続的にご支援",
          items: [
            "運用に関するご相談窓口",
            "小さな修正と改善のご依頼",
            "公開情報の定期確認",
            "月次での状況共有とご提案",
          ],
        },
      ],
      midCtaText:
        "ご予算やご希望の範囲に合わせて、作業項目を明記したPDFのお見積りを作成いたします。",
      midCtaButton: "無料で見積りを相談する",
    },
    flow: {
      eyebrow: "FLOW",
      title: "ご相談から導入までの流れ",
      durationLabel: "目安",
      steps: [
        {
          number: "01",
          title: "お問い合わせ",
          duration: "当日〜1営業日",
          description:
            "フォームまたはお電話で、現在のお困りごとや対象サイトのURLをお知らせください。",
        },
        {
          number: "02",
          title: "無料ヒアリング",
          duration: "30〜45分",
          description:
            "オンラインまたはお電話で、現状の業務、ご希望の納期、ご予算を伺います。",
        },
        {
          number: "03",
          title: "お見積り・ご提案",
          duration: "3〜5営業日",
          description:
            "診断結果または対応範囲を整理し、PDFのお見積書と進め方をご提示します。",
        },
        {
          number: "04",
          title: "制作・開発",
          duration: "2〜6週間",
          description:
            "決定した仕様に基づき構築を進め、節目ごとにご確認いただきながら調整します。",
        },
        {
          number: "05",
          title: "納品・サポート",
          duration: "1週間",
          description:
            "公開・稼働確認後に検収書類を発行し、運用開始後のご相談にも対応します。",
        },
      ],
    },
    commitments: {
      eyebrow: "COMMITMENTS",
      title: "私たちが大切にしている約束",
      items: [
        {
          number: "01",
          title: "非侵入型の診断方針",
          description:
            "診断は公開されている情報のみを対象とし、許可なくログイン試行、高負荷な検査、フォーム送信を行うことはありません。",
        },
        {
          number: "02",
          title: "書面と手続きの明確化",
          description:
            "NDA、お見積書、請求書、検収書をPDFで発行し、社内の稟議や経理手続きに対応します。",
        },
        {
          number: "03",
          title: "3名チームによる直接連携",
          description:
            "エンジニアリング、セキュリティ、AI/Web、窓口担当の3名が連携し、技術的な背景も含めて丁寧にご説明します。",
        },
        {
          number: "04",
          title: "日本語窓口での丁寧な進行",
          description:
            "日本国内在住のメンバーを窓口とし、日本語での円滑なやり取りを大切にしながら進行します。",
        },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "よくあるご質問",
      items: [
        {
          question: "無料サイト診断では、管理画面へのログインやシステムへの負荷はありますか。",
          answer:
            "ありません。HTTP応答ヘッダ、TLS証明書、DNSのメール認証設定、公開ファイルなど、外部から閲覧できる情報のみを確認します。",
        },
        {
          question: "まだホームページがありませんが、ゼロから相談できますか。",
          answer:
            "はい、ご相談いただけます。初めてのホームページ開設に向けた構成整理から制作・公開まで対応します。",
        },
        {
          question: "ExcelやAccessの業務管理をWebシステムに移行できますか。",
          answer:
            "はい、対応しています。現在の表計算ファイルやAccess、古いPHPシステムの内容を伺い、保守しやすいWebシステムへの刷新をご提案します。",
        },
        {
          question: "NDAや見積書・請求書などの書類発行に対応していますか。",
          answer:
            "はい。秘密保持契約書（NDA）、お見積書、請求書、検収書をPDF形式で発行します。",
        },
        {
          question: "見積りの作成に費用や日数はどのくらいかかりますか。",
          answer: "お見積りは無料です。発行までの目安は3〜5営業日です。",
        },
        {
          question: "遠方の事業所や海外本社との連携も相談できますか。",
          answer:
            `対応エリアは${serviceArea}です。オンラインでの打ち合わせを中心に、日本語でご相談いただけます。`,
        },
        {
          question: "最低契約期間や公開後の保守費用はありますか。",
          answer:
            `契約期間と作業範囲はお見積書に明記します。公開後の保守・伴走プランは${priceRetainer}を目安としています。`,
        },
        {
          question: "お支払い方法や支払い条件を教えてください。",
          answer:
            "お支払い方法と支払期限は、お見積書および請求書に記載します。ご希望の条件がありましたら事前にご相談ください。",
        },
      ],
    },
    company: {
      eyebrow: "COMPANY",
      title: "会社概要",
      rows: [
        { label: "会社名", value: legalName },
        { label: "代表者", value: representative },
        { label: "所在地", value: address },
        { label: "電話・受付時間", value: `${phone}（${hours}）` },
        { label: "メールアドレス", value: email },
        { label: "対応エリア", value: serviceArea },
        {
          label: "事業内容",
          value:
            "公開情報のみを確認する無料サイト診断／ホームページ制作・リニューアル／業務システムの改善・刷新",
        },
      ],
    },
    caseStudies: {
      eyebrow: "CASE STUDIES",
      title: "支援事例",
      lead: "業種ごとの課題に合わせて、公開情報の確認からWeb制作・業務システムの刷新まで対応してきた事例をご紹介します。",
      items: site.caseStudies.map((item) => ({
        meta: t(item.meta, "ja"),
        title: t(item.title, "ja"),
        summary: t(item.summary, "ja"),
        image: item.image ? { ...item.image, alt: t(item.title, "ja") } : null,
      })),
    },
    contact: {
      eyebrow: "CONTACT",
      title: "無料相談・診断のお申し込み",
      lead: "ご相談内容が整理できていない段階でも差し支えありません。まずは現在の状況をお知らせください。",
      phoneHeading: "お電話でのお問い合わせ",
      hoursPrefix: hoursLabel,
      replyLabel: "ご返信の目安",
      replyValue: replySla,
      nextStepsHeading: "送信後の流れ",
      nextSteps: [
        "内容を確認のうえ、担当者よりご連絡いたします。",
        "オンラインまたはお電話で、現状の課題とご希望を伺います。無料でご相談いただけます。",
        "診断結果またはPDFのお見積書をご提示します。",
      ],
      form: {
        topics: [
          "無料サイト診断",
          "ホームページ制作・リニューアル",
          "業務システムのご相談",
          "セキュリティのご相談",
          "その他",
        ],
        topicPlaceholder: "ご相談内容を選択してください",
        noWebsiteLabel: "まだホームページはありません",
        consentPrefix: "",
        privacyLabel: "プライバシーポリシー",
        consentSuffix: "に同意のうえ送信します",
        submitLabel: "この内容で無料相談を申し込む",
        submittingLabel: "送信中…",
        successTitle: "お問い合わせを受け付けました",
        successBody: `ご連絡ありがとうございます。ご入力内容を確認のうえ、${replySla}を目安にご連絡いたします。`,
        errorTitle: "入力内容をご確認のうえ、該当箇所を修正してください。",
        spamMessage: "送信を完了できませんでした。時間をおいて再度お試しください。",
        errorMessage: "送信中にエラーが発生しました。お手数ですが、再度お試しください。",
        errorCodes: {
          required: "必須項目をご入力ください。",
          invalidEmail: "メールアドレスの形式をご確認ください。",
          invalidPhone: "電話番号は10桁または11桁の数字でご入力ください。",
          invalidTopic: "ご相談内容を選択してください。",
          invalidUrl: "URLの形式（http:// または https://）をご確認ください。",
          tooLong: "1,000文字以内でご入力ください。",
        },
        fields: {
          company: {
            label: "会社名・屋号",
            requiredLabel: "必須",
            optionalLabel: "任意",
            placeholder: "株式会社ミライ",
            help: "個人事業主様や事務所名もこちらにご入力ください。",
          },
          name: {
            label: "ご担当者名",
            requiredLabel: "必須",
            optionalLabel: "任意",
            placeholder: "山田 太郎",
            help: "お名前をご入力ください。",
          },
          email: {
            label: "メールアドレス",
            requiredLabel: "必須",
            optionalLabel: "任意",
            placeholder: "name@example.co.jp",
            help: "ご返信先のメールアドレスをご入力ください。",
          },
          phone: {
            label: "電話番号",
            requiredLabel: "必須",
            optionalLabel: "任意",
            placeholder: phone,
            help: "ハイフンの有無は問いません。10桁または11桁でご入力ください。",
          },
          topic: {
            label: "ご相談内容",
            requiredLabel: "必須",
            optionalLabel: "任意",
            placeholder: "ご相談内容を選択してください",
            help: "最も近い項目を1つお選びください。",
          },
          websiteUrl: {
            label: "対象サイトURL",
            requiredLabel: "必須",
            optionalLabel: "任意",
            placeholder: "https://example.co.jp",
            help: "診断やリニューアルをご希望のサイトURLをご入力ください。未公開の場合は空欄でも構いません。",
          },
          message: {
            label: "ご相談の詳細",
            requiredLabel: "必須",
            optionalLabel: "任意",
            placeholder: "現在のホームページや業務フローの状況",
            help: "現状のお困りごとやご希望時期があればご記入ください。1,000文字以内です。",
          },
          consent: {
            label: "個人情報の取り扱い",
            requiredLabel: "必須",
            optionalLabel: "任意",
            placeholder: "",
            help: "内容をご確認のうえ、チェックを入れてください。",
          },
        },
      },
    },
    footer: {
      eyebrow: "FIRST STEP",
      title: "まずは非侵入の無料サイト診断から",
      body: "公開情報のみの確認から、Web制作・業務システム刷新のPDFお見積りまで、日本語窓口で丁寧にご対応します。",
      ctaLabel: "無料相談を申し込む",
      tagline:
        "中小企業・個人事務所様向けに、公開情報のみを確認する無料サイト診断、Web制作、表計算・Access・旧PHPからの業務システム刷新をご支援しています。",
      columns: [
        {
          title: "サービス・ご案内",
          items: [
            { label: "お悩み", href: "/#problems" },
            { label: "サービス", href: "/#services" },
            { label: "料金の目安", href: "/#pricing" },
            { label: "進め方", href: "/#flow" },
            { label: "会社概要", href: "/#company" },
          ],
        },
        {
          title: "お問い合わせ・情報",
          items: [
            { label: "無料相談", href: "/#contact" },
            { label: "ブログ", href: "/blog" },
            { label: "非侵入型診断・セキュリティ方針", href: "/security-policy" },
          ],
        },
        {
          title: "規約・法務情報",
          items: [
            { label: "プライバシーポリシー", href: "/privacy" },
            { label: "利用規約", href: "/terms" },
            { label: "特定商取引法に基づく表記", href: "/tokushoho" },
          ],
        },
      ],
      backToTopLabel: "ページの先頭へ",
      copyright,
    },
    legal: legalContent("ja", site),
  };
}
