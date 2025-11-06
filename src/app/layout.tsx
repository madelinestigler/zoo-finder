import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Zoo Hunter',
    description: 'Collaborative app for tracking rental property searches',
    icons: {
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦓</text></svg>",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gray-50">
                    <header className="bg-white shadow-sm border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16">
                                <div className="flex items-center">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        🦓 Zoo Hunter
                                    </h1>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                                            <span className="text-sm text-gray-600">Maddie</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                                            <span className="text-sm text-gray-600">Brittanie</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
} 