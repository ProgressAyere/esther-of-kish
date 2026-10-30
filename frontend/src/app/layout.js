import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif used for the brand name and headlines (Tailwind class: font-brand)
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata = {
  title: "Esther Of Kish | Handcrafted bead jewellery",
  description:
    "Handcrafted bead jewellery by Esther Of Kish: necklaces, bracelets, earrings, rings and sets.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
