import { Geist, Geist_Mono, Inter, Montserrat, Noto_Sans, Open_Sans, Work_Sans } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700']
})

export const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700']
})

export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700']
})

export const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700']
})

/** Marketing site typeface (Nimble-style public pages) */
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})
