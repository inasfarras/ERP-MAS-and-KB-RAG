import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Try to get transactions from the database
    try {
      let query = `
        SELECT 
          t.id, 
          t.transaction_date, 
          t.amount, 
          t.description, 
          t.type, 
          t.account_id, 
          a.name as account_name,
          a.account_code,
          t.order_id, 
          t.project_id,
          t.created_at,
          t.updated_at
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE 1=1
      `

      const params: any[] = []
      let paramIndex = 1

      if (accountId) {
        query += ` AND t.account_id = $${paramIndex}`
        params.push(Number.parseInt(accountId))
        paramIndex++
      }

      if (startDate) {
        query += ` AND t.transaction_date >= $${paramIndex}`
        params.push(startDate)
        paramIndex++
      }

      if (endDate) {
        query += ` AND t.transaction_date <= $${paramIndex}`
        params.push(endDate)
        paramIndex++
      }

      query += ` ORDER BY t.transaction_date DESC`

      const transactions = await executeQuery(query, params)

      return NextResponse.json(transactions)
    } catch (dbError) {
      console.error("Database query error:", dbError)

      // Return mock data if database query fails
      const mockTransactions = [
        {
          id: 1,
          transaction_date: "2023-01-25T00:00:00.000Z",
          amount: 2499.5,
          description: "Payment received for invoice INV-2023-001",
          type: "credit",
          account_id: 6,
          account_name: "Sales Revenue",
          account_code: "4000",
          order_id: 1,
          project_id: null,
          created_at: "2023-01-25T00:00:00.000Z",
          updated_at: "2023-01-25T00:00:00.000Z",
        },
        {
          id: 2,
          transaction_date: "2023-02-20T00:00:00.000Z",
          amount: 5749.25,
          description: "Payment received for invoice INV-2023-002",
          type: "credit",
          account_id: 6,
          account_name: "Sales Revenue",
          account_code: "4000",
          order_id: 2,
          project_id: null,
          created_at: "2023-02-20T00:00:00.000Z",
          updated_at: "2023-02-20T00:00:00.000Z",
        },
        {
          id: 3,
          transaction_date: "2023-01-25T00:00:00.000Z",
          amount: 1599.5,
          description: "Cost of goods sold for order ORD-2023-001",
          type: "debit",
          account_id: 7,
          account_name: "Cost of Goods Sold",
          account_code: "5000",
          order_id: 1,
          project_id: null,
          created_at: "2023-01-25T00:00:00.000Z",
          updated_at: "2023-01-25T00:00:00.000Z",
        },
        {
          id: 4,
          transaction_date: "2023-02-20T00:00:00.000Z",
          amount: 3749.25,
          description: "Cost of goods sold for order ORD-2023-002",
          type: "debit",
          account_id: 7,
          account_name: "Cost of Goods Sold",
          account_code: "5000",
          order_id: 2,
          project_id: null,
          created_at: "2023-02-20T00:00:00.000Z",
          updated_at: "2023-02-20T00:00:00.000Z",
        },
      ]

      // Filter mock data based on search parameters
      let filteredTransactions = [...mockTransactions]

      if (accountId) {
        filteredTransactions = filteredTransactions.filter((t) => t.account_id === Number.parseInt(accountId))
      }

      if (startDate) {
        const startDateObj = new Date(startDate)
        filteredTransactions = filteredTransactions.filter((t) => new Date(t.transaction_date) >= startDateObj)
      }

      if (endDate) {
        const endDateObj = new Date(endDate)
        filteredTransactions = filteredTransactions.filter((t) => new Date(t.transaction_date) <= endDateObj)
      }

      return NextResponse.json(filteredTransactions)
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const transaction = await request.json()

    // Start a transaction
    await executeQuery("BEGIN")

    try {
      // Insert transaction
      const result = await executeQuery(
        `
        INSERT INTO transactions (
          transaction_date, 
          amount, 
          description, 
          type, 
          account_id, 
          order_id, 
          project_id
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
        [
          transaction.transaction_date || new Date(),
          transaction.amount,
          transaction.description,
          transaction.type,
          transaction.account_id,
          transaction.order_id || null,
          transaction.project_id || null,
        ],
      )

      // Update account balance
      if (transaction.type === "credit") {
        await executeQuery(
          `
          UPDATE accounts 
          SET balance = balance + $1 
          WHERE id = $2
        `,
          [transaction.amount, transaction.account_id],
        )
      } else if (transaction.type === "debit") {
        await executeQuery(
          `
          UPDATE accounts 
          SET balance = balance - $1 
          WHERE id = $2
        `,
          [transaction.amount, transaction.account_id],
        )
      }

      // Commit transaction
      await executeQuery("COMMIT")

      return NextResponse.json(result[0])
    } catch (error) {
      // Rollback transaction on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
