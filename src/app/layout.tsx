import type { Metadata } from 'next'
import { AuthProvider } from '@/components/providers/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
    title: 'Cloud Desktop - ไฟล์ของคุณบนคลาวด์',
    description: 'ระบบจัดเก็บไฟล์บนคลาวด์ที่ทันสมัย เชื่อมต่อกับ Google Drive อัปโหลด จัดการ และแชร์ไฟล์ของคุณอย่างปลอดภัย',
    keywords: ['คลาวด์', 'จัดการไฟล์', 'google drive', 'cloud desktop'],
    authors: [{ name: 'Cloud Desktop Team' }],
    openGraph: {
        title: 'Cloud Desktop',
        description: 'ไฟล์ของคุณบนคลาวด์',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="th">
            <body className="bg-pattern">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
