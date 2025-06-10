import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the Neon connection string
export const sql = neon(process.env.DATABASE_URL!)

// Create a Drizzle client
export const db = drizzle(sql)

// Helper function for raw SQL queries
export async function executeQuery(query: string, params: unknown[] = []) {
  try {
    // Use sql.query instead of directly calling sql for parameterized queries
    const result = await sql.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
