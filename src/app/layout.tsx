import type { Metadata, Viewport } from "next";
import { Noto_Sans_Bengali, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/providers/providers";
import { SITE } from "@/lib/site";

const latin = Plus_Jakarta_Sans({
  variable: "--font-latin",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const bangla = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.nameBn} — ${SITE.tagline}`,
    template: `%s | ${SITE.nameBn}`,
  },
  description: SITE.shortDescription,
  applicationName: SITE.name,
  keywords: [
    "ঝামেলা নাই",
    "Jhamela Nai",
    "অনলাইন টুল বাংলাদেশ",
    "বাজেট প্ল্যানার",
    "খরচের হিসাব",
    "CV বিল্ডার",
    "invoice generator",
    "CGPA ক্যালকুলেটর",
    "free online tools BD",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "/",
    languages: { "bn-BD": SITE.url },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.nameBn} — ${SITE.tagline}`,
    description: SITE.shortDescription,
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    title: `${SITE.nameBn} — ${SITE.tagline}`,
    description: SITE.shortDescriptionEn,
  },
  category: SITE.category,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icon.png"],
  },
  appleWebApp: {
    capable: true,
    title: SITE.nameBn,
    statusBarStyle: "default",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor },
    { media: "(prefers-color-scheme: dark)", color: SITE.themeColorDark },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  alternateName: SITE.nameBn,
  url: SITE.url,
  applicationCategory: SITE.category,
  operatingSystem: "All",
  inLanguage: SITE.locale,
  description: SITE.shortDescription,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BDT",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={SITE.lang}
      dir="ltr"
      suppressHydrationWarning
      className={`${latin.variable} ${bangla.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <Providers>
          <script
            type="application/ld+json"
            // Structured data for rich results; static, trusted content only.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}