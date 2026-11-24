import type { Metadata } from "next";
import { LegalPageView } from "@/features/landing/components/legal-page-view";

export const metadata: Metadata = {
  title: "セキュリティ方針 | MIRAI Lab",
  description: "MIRAI Labのサイト診断と情報取り扱いに関するセキュリティ方針です。",
};

export default function SecurityPolicyPage() {
  return <LegalPageView slug="security-policy" />;
}
