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

const getAllIssueIntoDb = async () => {
    const result = await pool.query(`
        SELECT * FROM issues
        `)

    return result
}

const getSingleIssueIntoDB =async(id: string)=>{
    const result = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        `, [id])
    return result
}

const updateIssueIntoDB =async(id: string)=>{
    const result = await pool.query(`
        UPDATE issues
        SET title = COALESCE($1,name),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        status = COALESCE($4, status),

        RETURNING *
        `, [id])

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