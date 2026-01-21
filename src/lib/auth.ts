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
                    // This prevents race conditions where two requests check simultaneously
                    const result = await sql`
                        UPDATE otp_codes 
                        SET used = TRUE 
                        WHERE email = ${email} 
                        AND otp = ${otp}
                        AND expires_at > NOW()
                        AND used = FALSE
                        RETURNING *
                    `

                    if (result.length > 0) {
                        console.log('✅ OTP Verified Successfully (Atomic):', result[0])
                        return {
                            id: email,
                            email: email,
                            name: email.split('@')[0],
                        }
                    }

                    // If we get here, verification failed. Let's find out why for logging.
                    console.log('OTP verification failed (Atomic Update returned no rows)')

                    const check = await sql`
                        SELECT * FROM otp_codes 
                        WHERE email = ${email} 
                        AND otp = ${otp}
                        ORDER BY created_at DESC 
                        LIMIT 1
                    `

                    if (check.length > 0) {
                        const rec = check[0]
                        console.log('Found matching record state:', {
                            used: rec.used,
                            expired: new Date(rec.expires_at) < new Date(),
                            created_at: rec.created_at
                        })
                    } else {
                        console.log('No matching record found at all.')
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
