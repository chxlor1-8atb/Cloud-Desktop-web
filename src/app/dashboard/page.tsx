'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    Cloud, Upload, FolderPlus, Grid, List, Search,
    LogOut, User, HardDrive, FileText, Image, Video,
    Music, Archive, Folder, Download, Trash2, MoreVertical,
    X, Loader2, ChevronRight, Home, RefreshCw
} from 'lucide-react'
import { formatFileSize, getFileIcon } from '@/lib/google-drive'
import styles from './dashboard.module.css'

interface DriveFile {
    id: string
    name: string
    mimeType: string
    size?: string
    createdTime?: string
    modifiedTime?: string
    webViewLink?: string
    webContentLink?: string
    thumbnailLink?: string
}

interface BreadcrumbItem {
    id: string
    name: string
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [files, setFiles] = useState<DriveFile[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
        { id: 'root', name: 'My Drive' }
    ])
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [showNewFolderModal, setShowNewFolderModal] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [creatingFolder, setCreatingFolder] = useState(false)
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)
    const [storageQuota, setStorageQuota] = useState<{ used: number; limit: number } | null>(null)

    // Fetch files
    const fetchFiles = useCallback(async (folderId?: string) => {
        setLoading(true)
        try {
            const params = folderId ? `?folderId=${folderId}` : ''
            const res = await fetch(`/api/files${params}`)
            const data = await res.json()

            if (data.success) {
                setFiles(data.files)
            }
        } catch (error) {
            console.error('Error fetching files:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch storage quota
    const fetchStorageQuota = useCallback(async () => {
        try {
            const res = await fetch('/api/storage')
            const data = await res.json()

            if (data.success) {
                setStorageQuota(data.quota)
            }
        } catch (error) {
            console.error('Error fetching storage quota:', error)
        }
    }, [])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchFiles(currentFolderId || undefined)
            fetchStorageQuota()
        }
    }, [status, router, fetchFiles, fetchStorageQuota, currentFolderId])

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files
        if (!uploadedFiles?.length) return

        setUploading(true)

        try {
            for (const file of Array.from(uploadedFiles)) {
                const formData = new FormData()
                formData.append('file', file)
                if (currentFolderId) {
                    formData.append('folderId', currentFolderId)
                }

                await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })
            }

            await fetchFiles(currentFolderId || undefined)
        } catch (error) {
            console.error('Error uploading files:', error)
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    // Handle folder navigation
    const handleFolderClick = (folder: DriveFile) => {
        setCurrentFolderId(folder.id)
        setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }])
    }

    // Handle breadcrumb navigation
    const handleBreadcrumbClick = (index: number) => {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1)
        setBreadcrumbs(newBreadcrumbs)
        const folderId = index === 0 ? null : newBreadcrumbs[index].id
        setCurrentFolderId(folderId)
    }

    // Create new folder
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return

        setCreatingFolder(true)
        try {
            const res = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    folderName: newFolderName,
                    parentFolderId: currentFolderId,
                }),
            })

            if (res.ok) {
                await fetchFiles(currentFolderId || undefined)
                setShowNewFolderModal(false)
                setNewFolderName('')
            }
        } catch (error) {
            console.error('Error creating folder:', error)
        } finally {
            setCreatingFolder(false)
        }
    }

    // Delete file
    const handleDeleteFile = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return

        try {
            await fetch(`/api/files/${fileId}`, { method: 'DELETE' })
            await fetchFiles(currentFolderId || undefined)
            setSelectedFile(null)
        } catch (error) {
            console.error('Error deleting file:', error)
        }
    }

    // Filter files by search
    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Get file type icon
    const getFileTypeIcon = (mimeType: string) => {
        if (mimeType.includes('folder')) return <Folder size={24} />
        if (mimeType.includes('image')) return <Image size={24} />
        if (mimeType.includes('video')) return <Video size={24} />
        if (mimeType.includes('audio')) return <Music size={24} />
        if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive size={24} />
        return <FileText size={24} />
    }

    if (status === 'loading') {
        return (
            <div className={styles.loadingScreen}>
                <Loader2 className={styles.spinner} size={48} />
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Cloud size={32} className={styles.logoIcon} />
                    <span className={styles.logoText}>Cloud Desktop</span>
                </div>

                <div className={styles.sidebarActions}>
                    <label className={styles.uploadButton}>
                        <Upload size={20} />
                        <span>Upload</span>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                    </label>

                    <button
                        className={styles.newFolderButton}
                        onClick={() => setShowNewFolderModal(true)}
                    >
                        <FolderPlus size={20} />
                        <span>New Folder</span>
                    </button>
                </div>

                <nav className={styles.sidebarNav}>
                    <a href="#" className={`${styles.navItem} ${styles.active}`}>
                        <HardDrive size={20} />
                        <span>My Drive</span>
                    </a>
                </nav>

                {/* Storage Info */}
                {storageQuota && (
                    <div className={styles.storageInfo}>
                        <div className={styles.storageHeader}>
                            <HardDrive size={16} />
                            <span>Storage</span>
                        </div>
                        <div className={styles.storageBar}>
                            <div
                                className={styles.storageUsed}
                                style={{ width: `${Math.min((storageQuota.used / storageQuota.limit) * 100, 100)}%` }}
                            />
                        </div>
                        <p className={styles.storageText}>
                            {formatFileSize(storageQuota.used)} of {formatFileSize(storageQuota.limit)} used
                        </p>
                    </div>
                )}

                {/* User Profile */}
                <div className={styles.userProfile}>
                    <div className={styles.userAvatar}>
                        {session?.user?.image ? (
                            <img src={session.user.image} alt={session.user.name || ''} />
                        ) : (
                            <User size={24} />
                        )}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{session?.user?.name || 'User'}</span>
                        <span className={styles.userEmail}>{session?.user?.email}</span>
                    </div>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className={styles.logoutButton}>
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.searchBar}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search files and folders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.headerActions}>
                        <button
                            className={styles.refreshButton}
                            onClick={() => fetchFiles(currentFolderId || undefined)}
                            disabled={loading}
                        >
                            <RefreshCw size={20} className={loading ? styles.spinning : ''} />
                        </button>
                        <div className={styles.viewToggle}>
                            <button
                                className={viewMode === 'grid' ? styles.active : ''}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                className={viewMode === 'list' ? styles.active : ''}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Breadcrumbs */}
                <div className={styles.breadcrumbs}>
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.id} className={styles.breadcrumbItem}>
                            {index === 0 ? <Home size={16} /> : <ChevronRight size={16} />}
                            <button onClick={() => handleBreadcrumbClick(index)}>
                                {crumb.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Upload Progress */}
                {uploading && (
                    <div className={styles.uploadProgress}>
                        <Loader2 className={styles.spinner} size={20} />
                        <span>Uploading files...</span>
                    </div>
                )}

                {/* Files Grid/List */}
                {loading ? (
                    <div className={styles.loadingFiles}>
                        <Loader2 className={styles.spinner} size={32} />
                        <p>Loading files...</p>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Cloud size={64} />
                        <h3>No files yet</h3>
                        <p>Upload files or create folders to get started</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? styles.filesGrid : styles.filesList}>
                        {filteredFiles.map((file) => (
                            <div
                                key={file.id}
                                className={`${styles.fileCard} ${selectedFile?.id === file.id ? styles.selected : ''}`}
                                onClick={() => {
                                    if (file.mimeType.includes('folder')) {
                                        handleFolderClick(file)
                                    } else {
                                        setSelectedFile(file)
                                    }
                                }}
                                onDoubleClick={() => {
                                    if (!file.mimeType.includes('folder') && file.webViewLink) {
                                        window.open(file.webViewLink, '_blank')
                                    }
                                }}
                            >
                                <div className={styles.fileIcon}>
                                    {file.thumbnailLink ? (
                                        <img src={file.thumbnailLink} alt={file.name} />
                                    ) : (
                                        getFileTypeIcon(file.mimeType)
                                    )}
                                </div>
                                <div className={styles.fileInfo}>
                                    <span className={styles.fileName}>{file.name}</span>
                                    {viewMode === 'list' && (
                                        <>
                                            <span className={styles.fileSize}>
                                                {file.size ? formatFileSize(file.size) : '--'}
                                            </span>
                                            <span className={styles.fileDate}>
                                                {file.modifiedTime
                                                    ? new Date(file.modifiedTime).toLocaleDateString()
                                                    : '--'}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className={styles.fileActions}>
                                    <button onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedFile(file)
                                    }}>
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* File Details Sidebar */}
            {selectedFile && (
                <aside className={styles.detailsSidebar}>
                    <div className={styles.detailsHeader}>
                        <h3>File Details</h3>
                        <button onClick={() => setSelectedFile(null)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.detailsContent}>
                        <div className={styles.detailsPreview}>
                            {selectedFile.thumbnailLink ? (
                                <img src={selectedFile.thumbnailLink} alt={selectedFile.name} />
                            ) : (
                                getFileTypeIcon(selectedFile.mimeType)
                            )}
                        </div>

                        <h4 className={styles.detailsName}>{selectedFile.name}</h4>

                        <div className={styles.detailsInfo}>
                            <div className={styles.detailsRow}>
                                <span>Type</span>
                                <span>{selectedFile.mimeType.split('/').pop()}</span>
                            </div>
                            {selectedFile.size && (
                                <div className={styles.detailsRow}>
                                    <span>Size</span>
                                    <span>{formatFileSize(selectedFile.size)}</span>
                                </div>
                            )}
                            {selectedFile.modifiedTime && (
                                <div className={styles.detailsRow}>
                                    <span>Modified</span>
                                    <span>{new Date(selectedFile.modifiedTime).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.detailsActions}>
                            {selectedFile.webContentLink && (
                                <a
                                    href={selectedFile.webContentLink}
                                    className={styles.downloadButton}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download size={18} />
                                    Download
                                </a>
                            )}
                            {selectedFile.webViewLink && (
                                <a
                                    href={selectedFile.webViewLink}
                                    className={styles.viewButton}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open in Drive
                                </a>
                            )}
                            <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteFile(selectedFile.id)}
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className={styles.modalOverlay} onClick={() => setShowNewFolderModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>New Folder</h3>
                            <button onClick={() => setShowNewFolderModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <input
                                type="text"
                                placeholder="Folder name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowNewFolderModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.createButton}
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim() || creatingFolder}
                            >
                                {creatingFolder ? <Loader2 className={styles.spinner} size={18} /> : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
