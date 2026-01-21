'use client'

import React, { useState, useRef, useCallback } from 'react'
import { UploadCloud, File, X, Upload, Check } from 'lucide-react'
import styles from './file-uploader.module.css'
import { formatFileSize } from '@/lib/file-utils'

interface FileUploaderProps {
    onUpload: (files: File[]) => Promise<void>
    onClose: () => void
}

export default function FileUploader({ onUpload, onClose }: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files)
            setFiles(prev => [...prev, ...newFiles])
        }
    }, [])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles])
        }
    }, [])

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleUploadClick = async () => {
        if (files.length === 0) return

        setUploading(true)
        try {
            await onUpload(files)
            setUploadSuccess(true)
            setTimeout(() => {
                onClose()
            }, 1000)
        } catch (error) {
            console.error('Upload failed', error)
        } finally {
            setUploading(false)
        }
    }

    const openFileExplorer = () => {
        inputRef.current?.click()
    }

    if (uploadSuccess) {
        return (
            <div className={styles.container} style={{ cursor: 'default', borderColor: 'var(--success)' }}>
                <div className={styles.icon} style={{ background: 'var(--success)', color: 'white' }}>
                    <Check size={32} />
                </div>
                <h3>Upload Complete!</h3>
                <p className={styles.text}>Your files have been successfully uploaded.</p>
            </div>
        )
    }

    return (
        <div
            className={`${styles.container} ${dragActive ? styles.dragActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={files.length === 0 ? openFileExplorer : undefined}
        >
            <input
                ref={inputRef}
                className={styles.input}
                type="file"
                multiple
                onChange={handleChange}
            />

            {files.length === 0 ? (
                <>
                    <div className={styles.icon}>
                        <UploadCloud size={32} />
                    </div>
                    <button className={styles.button} onClick={(e) => {
                        e.stopPropagation()
                        openFileExplorer()
                    }}>
                        <Upload size={16} />
                        Select a file
                    </button>
                    <p className={styles.text}>or Drag and drop a file here</p>
                </>
            ) : (
                <>
                    <div className={styles.fileList} onClick={(e) => e.stopPropagation()}>
                        {files.map((file, index) => (
                            <div key={`${file.name}-${index}`} className={styles.fileItem}>
                                <div className={styles.fileInfo}>
                                    <File size={16} className="text-primary" />
                                    <div>
                                        <div className={styles.fileName}>{file.name}</div>
                                        <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
                                    </div>
                                </div>
                                <button
                                    className={styles.removeButton}
                                    onClick={() => handleRemoveFile(index)}
                                    disabled={uploading}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.uploadActions} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.cancelAction}
                            onClick={onClose}
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            className={styles.uploadAction}
                            onClick={handleUploadClick}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Files'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
