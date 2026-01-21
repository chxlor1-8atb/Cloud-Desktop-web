'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Cloud, Upload, Shield, Zap, ArrowRight, Loader2, Globe, Lock, Smartphone } from 'lucide-react'
import styles from './page.module.css'

export default function HomePage() {
    const { status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className={styles.loadingScreen}>
                <Loader2 className={styles.spinner} size={48} />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Background Effects */}
            <div className={styles.bgEffects}>
                <div className={styles.orb1}></div>
                <div className={styles.orb2}></div>
                <div className={styles.grid}></div>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <Cloud size={32} className={styles.logoIcon} />
                    <span>Cloud Desktop</span>
                </div>
                <div className={styles.navLinks}>
                    <Link href="/login" className={styles.navButton}>
                        Get Started
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgeDot}></span>
                        Cloud Storage Made Simple
                    </div>

                    <h1 className={styles.heroTitle}>
                        Your Files,
                        <br />
                        <span className={styles.gradientText}>Anywhere You Go</span>
                    </h1>

                    <p className={styles.heroDescription}>
                        Store, access, and share your files securely from any device.
                        Powered by Google Drive with a beautiful modern interface.
                    </p>

                    <div className={styles.heroActions}>
                        <Link href="/login" className={styles.primaryButton}>
                            Start Free
                            <ArrowRight size={20} />
                        </Link>
                        <a href="#features" className={styles.secondaryButton}>
                            Learn More
                        </a>
                    </div>

                    <div className={styles.heroBadges}>
                        <div className={styles.heroBadge}>
                            <Shield size={16} />
                            <span>Secure</span>
                        </div>
                        <div className={styles.heroBadge}>
                            <Zap size={16} />
                            <span>Fast</span>
                        </div>
                        <div className={styles.heroBadge}>
                            <Globe size={16} />
                            <span>Global CDN</span>
                        </div>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.browserMockup}>
                        <div className={styles.browserHeader}>
                            <div className={styles.browserDots}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div className={styles.browserUrl}>cloud-online.vercel.app</div>
                        </div>
                        <div className={styles.browserContent}>
                            <div className={styles.mockupSidebar}></div>
                            <div className={styles.mockupFiles}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className={styles.mockupFile}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <div className={styles.sectionHeader}>
                    <h2>Everything You Need</h2>
                    <p>Powerful features to manage your files efficiently</p>
                </div>

                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Upload size={28} />
                        </div>
                        <h3>Easy Upload</h3>
                        <p>Drag and drop files or browse to upload. Support for all file types.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Lock size={28} />
                        </div>
                        <h3>Secure Storage</h3>
                        <p>Your files are encrypted and stored safely on Google Drive infrastructure.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Smartphone size={28} />
                        </div>
                        <h3>Access Anywhere</h3>
                        <p>Access your files from any device - desktop, tablet, or mobile.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <Zap size={28} />
                        </div>
                        <h3>Lightning Fast</h3>
                        <p>Optimized for speed with global CDN and efficient data transfer.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className={styles.ctaContent}>
                    <h2>Ready to Get Started?</h2>
                    <p>Join now and get access to premium cloud storage</p>
                    <Link href="/login" className={styles.ctaButton}>
                        Get Started Free
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerLogo}>
                        <Cloud size={24} />
                        <span>Cloud Desktop</span>
                    </div>
                    <p className={styles.footerText}>
                        © {new Date().getFullYear()} Cloud Desktop. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
