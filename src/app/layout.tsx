import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://to-dogether.vercel.app'),
  title: "To-Dogether - Çiftler için Ortak Yapılacaklar Listesi",
  description: "Birlikte planlayın, birlikte başarın. Çiftler için görevlerinizi organize edin, hedefler koyun ve ilerlemenizi takip edin.",
  keywords: ["yapılacaklar", "ortak", "çiftler", "görev yönetimi", "verimlilik", "pwa", "progresif web uygulaması"],
  authors: [{ name: "To-Dogether Ekibi" }],
  creator: "To-Dogether",
  publisher: "To-Dogether",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "To-Dogether",
    startupImage: [
      {
        url: "/icons/icon-512.png",
        media: "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/icon-512.png",
        media: "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/icon-512.png",
        media: "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/icon-512.png",
        media: "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "To-Dogether",
    title: "To-Dogether - Çiftler için Ortak Yapılacaklar Listesi",
    description: "Birlikte planlayın, birlikte başarın. Çiftler için görevlerinizi organize edin, hedefler koyun ve ilerlemenizi takip edin.",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "To-Dogether Uygulama İkonu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "To-Dogether - Çiftler için Ortak Yapılacaklar Listesi",
    description: "Birlikte planlayın, birlikte başarın. Çiftler için görevlerinizi organize edin, hedefler koyun ve ilerlemenizi takip edin.",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/icon.svg",
        color: "#8B5CF6",
      },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8B5CF6" },
    { media: "(prefers-color-scheme: dark)", color: "#7C3AED" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="To-Dogether" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="To-Dogether" />
        <meta name="description" content="Birlikte planlayın, birlikte başarın. Çiftler için yapılacaklar uygulaması." />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#8B5CF6" />
        
        {/* Icons */}
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
        <link rel="mask-icon" href="/icons/icon.svg" color="#8B5CF6" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512.png" />
        
        {/* Prevent zoom on input focus */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        
        {/* Mobile optimizations */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="To-Dogether" />
        <meta name="msapplication-TileColor" content="#8B5CF6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased overflow-x-hidden" suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  )
}
