import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { SidebarShell } from "@/components/SidebarShell";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian",
  description: "Trusted journalism, one considered read at a time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        {/* Reads localStorage before first paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(localStorage.getItem('meridian_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body className="flex h-screen overflow-hidden bg-bg text-fg antialiased">
        <SidebarShell />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
