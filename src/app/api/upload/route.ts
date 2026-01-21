import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/google-drive'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const folderId = formData.get('folderId') as string | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Google Drive
        const uploadedFile = await uploadFile(
            buffer,
            file.name,
            file.type || 'application/octet-stream',
            folderId || undefined
        )

        return NextResponse.json({
            success: true,
            file: uploadedFile,
        })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        )
    }
}
