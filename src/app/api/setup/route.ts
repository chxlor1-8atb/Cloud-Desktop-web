import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS otp_codes (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `
        return NextResponse.json({ message: 'Table otp_codes created successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create table', details: error }, { status: 500 })
    }
}
