import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "DocGen - PDF Document Generator",
  description: "Generate professional PDF business documents from DOCX templates",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <ErrorBoundary>
          <Navigation />
          <main>{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
