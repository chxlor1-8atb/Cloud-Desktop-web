const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    // Manually read .env.local
    const envPath = path.join(__dirname, '.env.local');
    let dbUrl = '';

    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?$/m);
        if (match) {
            dbUrl = match[1];
        }
    } catch (e) {
        console.error('Could not read .env.local');
    }

    if (!dbUrl) {
        console.error('Error: DATABASE_URL not found in .env.local');
        process.exit(1);
    }

    const sql = postgres(dbUrl, { ssl: 'require' });

    try {
        console.log('Creating otp_codes table...');
        await sql`
            CREATE TABLE IF NOT EXISTS otp_codes (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Table otp_codes created or already exists.');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        await sql.end();
    }
}

setupDatabase();
