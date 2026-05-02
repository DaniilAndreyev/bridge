import type { Metadata } from "next";
import { Inter, Fira_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fira = Fira_Mono({
  weight: "400",
  variable: "--font-fira",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Bridge",
  description: "Anonymous messaging platform",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html
      lang="en"
      className={`${fira.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
