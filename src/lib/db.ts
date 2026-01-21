import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
    prepare: false, // Required for Supabase Transaction Pooler (port 6543)
})

export { sql }
