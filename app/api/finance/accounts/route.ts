import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    // Try to get accounts from the database
    try {
      const accounts = await executeQuery(`
        SELECT 
          id, 
          account_code, 
          name, 
          type, 
          balance,
          created_at,
          updated_at
        FROM accounts
        ORDER BY account_code
      `)

      return NextResponse.json(accounts)
    } catch (dbError) {
      console.error("Database query error:", dbError)

      // Return mock data if database query fails
      const mockAccounts = [
        {
          id: 1,
          account_code: "1000",
          name: "Cash",
          type: "asset",
          balance: 100000.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          account_code: "1100",
          name: "Accounts Receivable",
          type: "asset",
          balance: 25000.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          account_code: "1200",
          name: "Inventory",
          type: "asset",
          balance: 75000.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 4,
          account_code: "2000",
          name: "Accounts Payable",
          type: "liability",
          balance: 15000.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 5,
          account_code: "3000",
          name: "Equity",
          type: "equity",
          balance: 185000.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 6,
          account_code: "4000",
          name: "Sales Revenue",
          type: "revenue",
          balance: 8248.75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 7,
          account_code: "5000",
          name: "Cost of Goods Sold",
          type: "expense",
          balance: 5348.75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 8,
          account_code: "6000",
          name: "Operating Expenses",
          type: "expense",
          balance: 0.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      return NextResponse.json(mockAccounts)
    }
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const account = await request.json()

    const result = await executeQuery(
      `
      INSERT INTO accounts (
        account_code, 
        name, 
        type, 
        balance
      ) 
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [account.account_code, account.name, account.type, account.balance || 0],
    )

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
