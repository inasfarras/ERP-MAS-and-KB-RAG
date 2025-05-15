import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const customerId = searchParams.get("customerId")

    let query = `
      SELECT 
        p.id, 
        p.project_code, 
        p.name, 
        p.description, 
        p.customer_id, 
        c.name as customer_name,
        p.start_date, 
        p.end_date, 
        p.budget, 
        p.status,
        p.created_at,
        p.updated_at,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (status) {
      query += ` AND p.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (customerId) {
      query += ` AND p.customer_id = $${paramIndex}`
      params.push(Number.parseInt(customerId))
      paramIndex++
    }

    query += ` ORDER BY p.start_date DESC`

    const projects = await executeQuery(query, params)

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const project = await request.json()

    // Start a transaction
    await executeQuery("BEGIN")

    try {
      // Insert project
      const projectResult = await executeQuery(
        `
        INSERT INTO projects (
          project_code, 
          name, 
          description, 
          customer_id, 
          start_date, 
          end_date, 
          budget, 
          status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
        [
          project.project_code,
          project.name,
          project.description,
          project.customer_id || null,
          project.start_date,
          project.end_date,
          project.budget,
          project.status || "planning",
        ],
      )

      const projectId = projectResult[0].id

      // Insert tasks if provided
      if (project.tasks && project.tasks.length > 0) {
        for (const task of project.tasks) {
          await executeQuery(
            `
            INSERT INTO tasks (
              project_id, 
              name, 
              description, 
              start_date, 
              end_date, 
              assigned_to, 
              status, 
              progress
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
            [
              projectId,
              task.name,
              task.description,
              task.start_date,
              task.end_date,
              task.assigned_to || null,
              task.status || "not-started",
              task.progress || 0,
            ],
          )
        }
      }

      // Commit transaction
      await executeQuery("COMMIT")

      // Get the complete project with tasks
      const projectData = await executeQuery(
        `
        SELECT * FROM projects WHERE id = $1
      `,
        [projectId],
      )

      const tasks = await executeQuery(
        `
        SELECT * FROM tasks WHERE project_id = $1
      `,
        [projectId],
      )

      return NextResponse.json({
        ...projectData[0],
        tasks,
      })
    } catch (error) {
      // Rollback transaction on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
