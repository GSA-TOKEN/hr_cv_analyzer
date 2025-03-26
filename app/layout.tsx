import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import './globals.css'
import { Toaster } from "sonner"
import Link from 'next/link'
import { FileText, Users, BarChart } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HR CV Analyzer',
  description: 'AI-powered CV analysis and management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b shadow-sm">
          <div className="container mx-auto flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold">
                HR CV Analyzer
              </Link>
            </div>
            <nav className="flex space-x-6">
              <Link
                href="/cvs"
                className="inline-flex items-center text-sm px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                CV Management
              </Link>
              <Link
                href="/candidates"
                className="inline-flex items-center text-sm px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Candidate Search
              </Link>
              <Link
                href="/cv-test"
                className="inline-flex items-center text-sm px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
              >
                <BarChart className="h-4 w-4 mr-2" />
                CV Test
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)]">
          <Toaster position="top-right" />
          {children}
        </main>
      </body>
    </html>
  )
}
