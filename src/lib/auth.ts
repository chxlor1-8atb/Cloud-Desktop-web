import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { sql } from './db'

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            id: 'otp',
            name: 'Email OTP',
            credentials: {
                email: { label: 'Email', type: 'email' },
                otp: { label: 'OTP', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.otp) {
                    console.log('Missing credentials')
                    return null
                }

                const email = credentials.email.toLowerCase().trim()
                const otp = credentials.otp.trim()

                try {
                    console.log(`Verifying OTP for ${email} with code ${otp}`)

                    // Atomic Validate-and-Mark-Used
                    const result = await sql`
                        UPDATE otp_codes 
                        SET used = TRUE, used_at = NOW()
                        WHERE email = ${email} 
                        AND otp = ${otp}
                        AND expires_at > NOW()
                        AND used = FALSE
                        RETURNING *
                    `

                    if (result.length > 0) {
                        console.log('✅ OTP Verified Successfully:', result[0])
                        return {
                            id: email,
                            email: email,
                            name: email.split('@')[0],
                        }
                    }

                    // Verification failed analysis
                    console.log('OTP verification failed - Analyzing why...')

                    const check = await sql`
                        SELECT * FROM otp_codes 
                        WHERE email = ${email} 
                        AND otp = ${otp}
                        ORDER BY created_at DESC 
                        LIMIT 1
                    `

                    if (check.length > 0) {
                        const rec = check[0]
                        const isExpired = new Date(rec.expires_at) < new Date()
                        const isUsed = rec.used
                        const usedAt = rec.used_at ? new Date(rec.used_at) : null
                        const now = new Date()

                        console.log(`❌ Found record but invalid: Used=${isUsed}, Expired=${isExpired}, UsedAt=${usedAt}`)

                        if (isUsed && usedAt) {
                            // Idempotency: Allow recently used OTP (within 10 seconds) to succeed again
                            // This solves "double-click" or "network retry" race conditions
                            const timeDiff = now.getTime() - usedAt.getTime()
                            if (timeDiff < 10000) { // 10 seconds window
                                console.log(`⚠️ Idempotency check: OTP used ${timeDiff}ms ago. Allowing login.`)
                                return {
                                    id: email,
                                    email: email,
                                    name: email.split('@')[0],
                                }
                            }
                            console.log('   (Likely duplicate request or replay attack outside window)')
                        }
                    } else {
                        console.log('❌ No record found for this Email+OTP combination.')
                    }

                    return null

                } catch (error) {
                    console.error('Error verifying OTP - Database error:', error)
                    return null
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to store OTP
export async function storeOTP(email: string, otp: string) {
    const cleanEmail = email.toLowerCase().trim()
    // Use Database Time for consistency
    await sql`
        INSERT INTO otp_codes (email, otp, expires_at, used)
        VALUES (${cleanEmail}, ${otp}, NOW() + INTERVAL '5 minutes', FALSE)
    `
}

// Helper function to generate OTP
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}
