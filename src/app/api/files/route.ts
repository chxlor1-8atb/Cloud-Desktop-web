import { NextRequest, NextResponse } from 'next/server'
import { listFiles, createFolder } from '@/lib/google-drive'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const folderId = searchParams.get('folderId') || undefined

        const files = await listFiles(folderId)

        return NextResponse.json({
            success: true,
            files,
        })
    } catch (error) {
        console.error('Error listing files:', error)
        return NextResponse.json(
            { error: 'Failed to list files' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { folderName, parentFolderId } = await request.json()

        if (!folderName) {
            return NextResponse.json(
                { error: 'Folder name is required' },
                { status: 400 }
            )
        }

        const folder = await createFolder(folderName, parentFolderId)

        return NextResponse.json({
            success: true,
            folder,
        })
    } catch (error) {
        console.error('Error creating folder:', error)
        return NextResponse.json(
            { error: 'Failed to create folder' },
            { status: 500 }
        )
    }
}
