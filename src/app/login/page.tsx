'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import Image from 'next/image'
import icon from '../icon.png'
import styles from './login.module.css'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'email' | 'otp'>('email')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'ไม่สามารถส่ง OTP ได้')
            }

            setStep('otp')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดบางอย่าง')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await signIn('otp', {
                email,
                otp,
                redirect: false,
            })

            if (result?.error) {
                throw new Error('รหัส OTP ไม่ถูกต้อง')
            }

            router.push('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดบางอย่าง')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/dashboard' })
    }

    return (
        <div className={styles.container}>
            {/* Background Effects */}
            <div className={styles.bgEffects}>
                <div className={styles.orb1}></div>
                <div className={styles.orb2}></div>
                <div className={styles.orb3}></div>
            </div>

            {/* Login Card */}
            <div className={styles.card}>
                {/* Logo */}
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <Image
                            src={icon}
                            alt="Cloud Desktop Logo"
                            width={100}
                            height={100}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                    <h1 className={styles.logoText}>Cloud Desktop</h1>
                    <p className={styles.logoSubtext}>ไฟล์ของคุณบนคลาวด์</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {/* Email Step */}
                {step === 'email' && (
                    <form onSubmit={handleSendOTP} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <Mail className={styles.inputIcon} size={20} />
                            <input
                                type="email"
                                placeholder="กรอกอีเมลของคุณ"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading || !email}
                        >
                            {loading ? (
                                <Loader2 className={styles.spinner} size={20} />
                            ) : (
                                <>
                                    ส่งรหัส OTP
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* OTP Step */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOTP} className={styles.form}>
                        <p className={styles.otpInfo}>
                            เราได้ส่งรหัสไปยัง <strong>{email}</strong>
                        </p>

                        <div className={styles.inputGroup}>
                            <Lock className={styles.inputIcon} size={20} />
                            <input
                                type="text"
                                placeholder="กรอกรหัส OTP 6 หลัก"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className={styles.input}
                                required
                                disabled={loading}
                                maxLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading || otp.length !== 6}
                        >
                            {loading ? (
                                <Loader2 className={styles.spinner} size={20} />
                            ) : (
                                <>
                                    ยืนยันและเข้าสู่ระบบ
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => {
                                setStep('email')
                                setOtp('')
                                setError('')
                            }}
                        >
                            ← กลับไปหน้าอีเมล
                        </button>
                    </form>
                )}

                {/* Divider */}
                <div className={styles.divider}>
                    <span>หรือดำเนินการต่อด้วย</span>
                </div>

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    className={styles.googleButton}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    เข้าสู่ระบบด้วย Google
                </button>
            </div>
        </div>
    )
}
