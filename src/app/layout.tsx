import type { Metadata } from "next";
import "./globals.css";
import { geistSans, notoSans, geistMono, openSans, montserrat, workSans, inter } from "./ui/fonts";
import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: { default: "BizPilot", template: "%s · BizPilot" },
  description: "Run your client work and business operations from one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${notoSans.variable} ${geistMono.variable} ${openSans.variable} ${montserrat.variable} ${workSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
