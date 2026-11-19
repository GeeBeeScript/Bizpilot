import type { Metadata } from "next";
import "./globals.css";
import { poppins, instrumentSans, geistMono, inter } from "./ui/fonts";
import AppProviders from "@/app/components/providers/AppProviders";

export const metadata: Metadata = {
  title: { default: "BizPilot", template: "%s · BizPilot" },
  description: "Run your client work and business operations from one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${instrumentSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
