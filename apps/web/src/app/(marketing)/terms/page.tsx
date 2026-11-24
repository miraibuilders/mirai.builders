import type { Metadata } from "next";
import { LegalPageView } from "@/features/landing/components/legal-page-view";

export const metadata: Metadata = {
  title: "利用規約 | MIRAI Lab",
  description: "MIRAI Labのサービスをご利用いただく際の規約です。",
};

export default function TermsPage() {
  return <LegalPageView slug="terms" />;
}
