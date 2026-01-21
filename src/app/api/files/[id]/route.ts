import { NextRequest, NextResponse } from 'next/server'
import { getFile, downloadFile, deleteFile } from '@/lib/google-drive'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = params.id
        const { searchParams } = new URL(request.url)
        const download = searchParams.get('download') === 'true'

        if (download) {
            const [file, content] = await Promise.all([
                getFile(fileId),
                downloadFile(fileId),
            ])

            return new NextResponse(content, {
                headers: {
                    'Content-Type': file.mimeType,
                    'Content-Disposition': `attachment; filename="${file.name}"`,
                },
            })
        }

        const file = await getFile(fileId)

        return NextResponse.json({
            success: true,
            file,
        })
    } catch (error) {
        console.error('Error getting file:', error)
        return NextResponse.json(
            { error: 'Failed to get file' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = params.id

        await deleteFile(fileId)

        return NextResponse.json({
            success: true,
            message: 'File deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting file:', error)
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        )
    }
}
