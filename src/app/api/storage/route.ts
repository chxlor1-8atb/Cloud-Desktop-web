import { NextResponse } from 'next/server'
import { getStorageQuota } from '@/lib/google-drive'

export async function GET() {
    try {
        const quota = await getStorageQuota()

        return NextResponse.json({
            success: true,
            quota,
        })
    } catch (error) {
        console.error('Error getting storage quota:', error)
        return NextResponse.json(
            { error: 'Failed to get storage quota' },
            { status: 500 }
        )
    }
}
