import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import NextAuthProvider from "@/Providers/NextAuthProvider";
import SessionWrapper from "@/components/SessionWrapper";
import "react-datepicker/dist/react-datepicker.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "NM | Garments Inventory Management",
    template: "%s | NM",
  },
  description: "NM is a comprehensive Garments Inventory Application designed for efficient stock tracking, order management, and real-time analytics in the apparel industry.",
  keywords: ["garments inventory", "inventory management system", "apparel stock tracking", "NM inventory"],
  authors: [{ name: "NM Team" }],
  creator: "NM",
  publisher: "NM Inc.",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "NM - Garments Inventory Solution",
    description: "Streamline your garments business with our advanced inventory tracking system.",
    url: "https://yourdomain.com", 
    siteName: "NM Inventory",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NM | Garments Inventory Management",
    description: "Manage your garments production and stock effortlessly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextAuthProvider>
          <SessionWrapper>
            {children}
            <ToastContainer />
          </SessionWrapper>
        </NextAuthProvider>
      </body>
    </html>
  );
}
