import { Geist_Mono, Inter, Instrument_Sans, Poppins } from "next/font/google";

/** Product display face: headings, top bar and every bold/semibold run of text */
export const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Product text face: body copy, navigation, tables and numbers */
export const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

/** Shortcuts, IDs and code */
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Marketing site typeface (Nimble-style public pages) */
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
