import dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

dotenv.config({ path: '.env.local' })
dotenv.config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL || 'postgresql://postgres:59v7zkVLCLn8b2SP@db.epcmjgfyswweptjmjaig.supabase.co:5432/postgres?sslmode=require',
  },
})
