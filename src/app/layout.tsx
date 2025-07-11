import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const metadata: Metadata = {
  title: "To-Dogether - Collaborative Todo Lists",
  description: "Collaborative todo list app for couples. Manage your tasks together.",
  keywords: ["todo", "collaborative", "couples", "task management", "productivity"],
  authors: [{ name: "To-Dogether Team" }],
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
  },
  openGraph: {
    type: "website",
    siteName: "To-Dogether",
    title: "To-Dogether - Collaborative Todo Lists",
    description: "Collaborative todo list app for couples. Manage your tasks together.",
  },
  twitter: {
    card: "summary",
    title: "To-Dogether - Collaborative Todo Lists",
    description: "Collaborative todo list app for couples. Manage your tasks together.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="To-Dogether" />
        <meta name="apple-mobile-web-app-title" content="To-Dogether" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
