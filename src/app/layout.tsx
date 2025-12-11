import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { UiLanguageProvider } from "./ui-language";

export const metadata: Metadata = {
  title: "CoverLetter Gen",
  description:
    "Genera cartas de presentación personalizadas usando IA, tu CV y la descripción del puesto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-50">
        <UiLanguageProvider>
          <Navbar />
          <main>{children}</main>
        </UiLanguageProvider>
      </body>
    </html>
  );
}
