import 'server-only'
import { google } from 'googleapis'

// Initialize Google Drive client with service account
function getGoogleDriveClient() {
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')

    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive'],
    })

    return google.drive({ version: 'v3', auth })
}

export interface DriveFile {
    id: string
    name: string
    mimeType: string
    size?: string
    createdTime?: string
    modifiedTime?: string
    webViewLink?: string
    webContentLink?: string
    thumbnailLink?: string
    iconLink?: string
}

// List files in the folder
export async function listFiles(folderId?: string): Promise<DriveFile[]> {
    const drive = getGoogleDriveClient()
    const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID

    try {
        const response = await drive.files.list({
            q: `'${targetFolderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink)',
            orderBy: 'modifiedTime desc',
            pageSize: 100,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        })

        return (response.data.files || []) as DriveFile[]
    } catch (error) {
        console.error('Error listing files:', error)
        throw error
    }
}

// Upload file to Google Drive
export async function uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folderId?: string
): Promise<DriveFile> {
    const drive = getGoogleDriveClient()
    const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID

    try {
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [targetFolderId!],
            },
            media: {
                mimeType,
                body: require('stream').Readable.from(file),
            },
            fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink',
            supportsAllDrives: true,
        })

        return response.data as DriveFile
    } catch (error) {
        console.error('Error uploading file:', error)
        throw error
    }
}

// Get file metadata
export async function getFile(fileId: string): Promise<DriveFile> {
    const drive = getGoogleDriveClient()

    try {
        const response = await drive.files.get({
            fileId,
            fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink',
        })

        return response.data as DriveFile
    } catch (error) {
        console.error('Error getting file:', error)
        throw error
    }
}

// Download file content
export async function downloadFile(fileId: string): Promise<Buffer> {
    const drive = getGoogleDriveClient()

    try {
        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        )

        return Buffer.from(response.data as ArrayBuffer)
    } catch (error) {
        console.error('Error downloading file:', error)
        throw error
    }
}

// Delete file
export async function deleteFile(fileId: string): Promise<void> {
    const drive = getGoogleDriveClient()

    try {
        await drive.files.delete({ fileId })
    } catch (error) {
        console.error('Error deleting file:', error)
        throw error
    }
}

// Create folder
export async function createFolder(
    folderName: string,
    parentFolderId?: string
): Promise<DriveFile> {
    const drive = getGoogleDriveClient()
    const targetParentId = parentFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID

    try {
        const response = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [targetParentId!],
            },
            fields: 'id, name, mimeType, createdTime',
        })

        return response.data as DriveFile
    } catch (error) {
        console.error('Error creating folder:', error)
        throw error
    }
}

// Get storage quota
export async function getStorageQuota(): Promise<{ used: number; limit: number }> {
    const drive = getGoogleDriveClient()

    try {
        const response = await drive.about.get({
            fields: 'storageQuota',
        })

        const quota = response.data.storageQuota
        return {
            used: parseInt(quota?.usage || '0'),
            limit: parseInt(quota?.limit || '0'),
        }
    } catch (error) {
        console.error('Error getting storage quota:', error)
        throw error
    }
}

// Helper to get file icon based on mime type
export function getFileIcon(mimeType: string): string {
    if (mimeType.includes('folder')) return '📁'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('video')) return '🎬'
    if (mimeType.includes('audio')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦'
    if (mimeType.includes('text')) return '📃'
    return '📄'
}

// Format file size
export function formatFileSize(bytes: string | number): string {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes
    if (size === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(size) / Math.log(k))

    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
