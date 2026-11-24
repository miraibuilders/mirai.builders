import type { Metadata } from "next";
import { LegalPageView } from "@/features/landing/components/legal-page-view";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | MIRAI Lab",
  description: "MIRAI Labの特定商取引法に基づく表記です。",
};

export default function TokushohoPage() {
  return <LegalPageView slug="tokushoho" />;
}
