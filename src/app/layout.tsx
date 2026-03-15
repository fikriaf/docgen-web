import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

export const metadata: Metadata = {
  title: "DocGen - PDF Document Generator",
  description: "Generate professional PDF business documents from DOCX templates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
