import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  return NextResponse.json([
    { id: 1, name: 'Cash', type: 'asset', balance: 10000 },
    { id: 2, name: 'Accounts Receivable', type: 'asset', balance: 5000 },
    { id: 3, name: 'Accounts Payable', type: 'liability', balance: 2000 },
    { id: 4, name: 'Revenue', type: 'revenue', balance: 15000 },
    { id: 5, name: 'Expenses', type: 'expense', balance: 7000 },
    { id: 6, name: 'Equity', type: 'equity', balance: 8000 },
  ]);
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
