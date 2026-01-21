import type { Metadata } from 'next'
import { AuthProvider } from '@/components/providers/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
    title: 'Cloud Desktop - ไฟล์ของคุณบนคลาวด์',
    description: 'โซลูชันการจัดเก็บข้อมูลบนคลาวด์ที่ทันสมัยพร้อมการเชื่อมต่อ Google Drive อัปโหลด จัดการ และแชร์ไฟล์ของคุณอย่างปลอดภัย',
    keywords: ['cloud storage', 'file management', 'google drive', 'cloud desktop', 'จัดเก็บไฟล์', 'คลาวด์'],
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
        <html lang="en">
            <body className="bg-pattern">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
