import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, storeOTP } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Generate and store OTP
        const otp = generateOTP()
        await storeOTP(email, otp)

        // Send OTP via email
        await sendOTPEmail(email, otp)

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
        })
    } catch (error) {
        console.error('Error sending OTP:', error)
        return NextResponse.json(
            { error: 'Failed to send OTP' },
            { status: 500 }
        )
    }
}
