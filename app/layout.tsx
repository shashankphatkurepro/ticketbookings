import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BookingProvider } from "./context/BookingContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "New Year's Eve 2026 | Mangozzz Resort",
  description: "Join us for the ultimate New Year's Eve celebration at Mangozzz Magical World Resort. Live DJ, unlimited buffet, fireworks & more!",
  keywords: ["new year eve", "2026", "party", "resort", "mangozzz", "thane", "mumbai"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <BookingProvider>
          {children}
        </BookingProvider>
      </body>
    </html>
  );
}
