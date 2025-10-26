import { Geist, Geist_Mono, Caveat, Great_Vibes } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../components/AuthProvider';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveatFont = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const greatVibesFont = Great_Vibes({
  subsets: ['latin'],
  variable: '--font-great-vibes',
  weight: ['400'],
  display: 'swap',
});

export const metadata = {
  title: "MEMORA - Share & Discover",
  description: "A platform to share your memories and discover inspiring content",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <head>
        <Script
          defer
          data-website-id="dfid_9j3K38mp6uMUL4KvD5UKP"
          data-domain="memora-blog.vercel.app"
          src="https://datafa.st/js/script.js">
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveatFont.variable} ${greatVibesFont.variable} bg-black text-white antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
