import type { IIssue } from "./issue.interface";
import { pool } from "../../DB";

const createIssueIntoDb = async (payload: IIssue) => {
    const { title, description, type, reporter_id } = payload
    const status = payload.status || "open"

    const result = await pool.query(`
        INSERT INTO issues( title, description, type, status, reporter_id) VALUES ($1, $2, $3, $4, $5) RETURNING *
        `, [ title, description, type, status, reporter_id])
    
    return result    
}

const getAllIssueIntoDb = async (filters?: { sort?: string; type?: string; status?: string }) => {
    let query = `SELECT * FROM issues`
    const conditions: string[] = []
    const values: (string | number)[] = []

    if (filters?.type) {
        values.push(filters.type)
        conditions.push(`type = $${values.length}`)
    }

    if (filters?.status) {
        values.push(filters.status)
        conditions.push(`status = $${values.length}`)
    }

    if (conditions.length) {
        query += ` WHERE ${conditions.join(" AND ")}`
    }

    const order = filters?.sort === "oldest" ? "ASC" : "DESC"
    query += ` ORDER BY created_at ${order}`

    const result = await pool.query(query, values)
    return result
}

const getSingleIssueIntoDB =async(id: string)=>{
    const result = await pool.query(`
        SELECT 
            issues.id,
            issues.title,
            issues.description,
            issues.type,
            issues.status,
            issues.created_at,
            issues.updated_at,
            users.id as reporter_id,
            users.name as reporter_name,
            users.role as reporter_role
        FROM issues
        LEFT JOIN users ON issues.reporter_id = users.id
        WHERE issues.id = $1
        `, [id])
    return result
}

const updateIssueIntoDB =async(payload: { title?: string; description?: string; type?: string; status?: string; id: string | number })=>{
    const { title, description, type, status, id } = payload
    const result = await pool.query(`
        UPDATE issues
        SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),
        updated_at = NOW()
        WHERE id = $5
        RETURNING *
        `, [title, description, type, status, id])

        return result
}

const deleteIssueIntoDB = async(id: string)=>{
    const result = await pool.query(`
        DELETE FROM issues WHERE $1

        RETURNING *
        `,[id])
    return result
}

export const issueService = {
    createIssueIntoDb,
    getAllIssueIntoDb,
    getSingleIssueIntoDB,
    updateIssueIntoDB,
    deleteIssueIntoDB
}