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

                        console.log(`❌ Found record but invalid: Used=${isUsed}, Expired=${isExpired}`)

                        if (isUsed) {
                            // If it was used less than 2 seconds ago, it might be a double-click race condition
                            // We could opt to allow it, but for security strictness, we reject.
                            console.log('   (Likely duplicate request or replay attack)')
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
