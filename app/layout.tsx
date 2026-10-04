
import { getI18n } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";
import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "RBA Property | Contemporary Bali Property",
  description:
    "Curated villas, land, and investment properties across Bali's most desirable locations.",
};

export const viewport: Viewport = { themeColor: "#F3EFE7" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { t, locale } = await getI18n();
  return (
    <html lang={locale}>
      <body className={`${geist.variable} ${newsreader.variable}`}>
        <a href="#main-content" className="skip-link">{t("Skip to Main Content")}</a>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
