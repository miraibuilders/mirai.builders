import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { siteContent, t, type Locale } from "@/content/site";
import { ToastProvider } from "@/ui/toast";
import "./globals.css";
import "../ui/ui.css";
import "../ui/shell.css";

const locale: Locale = "ja";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: t(siteContent.brand.name, locale),
  description: t(siteContent.metaDescriptions.root, locale),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSansJp.variable}>
      <body className={notoSansJp.className}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
