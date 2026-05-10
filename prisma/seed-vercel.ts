/**
 * One-time post-deployment seed script.
 * Run after setting DATABASE_URL in Vercel env:
 *   npx tsx prisma/seed-vercel.ts
 */
import { main as runSeed } from "../src/server/db/seed"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/lib/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export { runSeed as seed }

runSeed()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
