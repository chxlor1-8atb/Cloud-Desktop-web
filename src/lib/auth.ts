import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>()

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
                    return null
                }

                const stored = otpStore.get(credentials.email)

                if (!stored) {
                    return null
                }

                if (Date.now() > stored.expires) {
                    otpStore.delete(credentials.email)
                    return null
                }

                if (stored.otp !== credentials.otp) {
                    return null
                }

                // OTP is valid, delete it
                otpStore.delete(credentials.email)

                return {
                    id: credentials.email,
                    email: credentials.email,
                    name: credentials.email.split('@')[0],
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
export function storeOTP(email: string, otp: string) {
    otpStore.set(email, {
        otp,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    })
}

// Helper function to generate OTP
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}
