import type { Metadata } from 'next'
import { AuthProvider } from '@/components/providers/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
    title: 'Cloud Desktop - Your Files in the Cloud',
    description: 'A modern cloud storage solution with Google Drive integration. Upload, manage, and share your files securely.',
    keywords: ['cloud storage', 'file management', 'google drive', 'cloud desktop'],
    authors: [{ name: 'Cloud Desktop Team' }],
    openGraph: {
        title: 'Cloud Desktop',
        description: 'Your Files in the Cloud',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="bg-pattern">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
