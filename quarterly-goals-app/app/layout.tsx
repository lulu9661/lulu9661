import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Quarterly Goals",
  description: "Set and track your quarterly goals with intention",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900 font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
