import type { Metadata } from "next";
import { LegalPageView } from "@/features/landing/components/legal-page-view";

export const metadata: Metadata = {
  title: "プライバシーポリシー | MIRAI Lab",
  description: "MIRAI Labの個人情報の取り扱いについてご説明します。",
};

export default function PrivacyPage() {
  return <LegalPageView slug="privacy" />;
}
