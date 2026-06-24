import type { Request, Response } from "express";
import type { IIssueResponse } from "./issue.interface";
import { issueService } from "./issue.service";


const createIssue = async(req: Request, res: Response )=>{
    try {
        const { title, description, type } = req.body

        if (req.user?.role !== "contributor" && req.user?.role !== "maintainer") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
                data: {},
            })
        }

        const reporter_id = req.user.id

        const result = await issueService.createIssueIntoDb({
            title,
            description,
            type,
            status: "open",
            reporter_id
        })

        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0],
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error,
        })
    }
}

const getAllIssue = async(req: Request, res: Response)=>{
    try {
        const result = await issueService.getAllIssueIntoDb()
        res.status(201).json({
            success: true,
            massage: "issue retrived Successfully",
            data: result.rows[0]
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error
        })
    }
}

const getSingleIssue = async(req: Request, res: Response)=>{
    const { id } = req.params
    try {
        const result = await issueService.getSingleIssueIntoDB(id as string)
        if(result.rows.length === 0){
            return res.status(404).json({
            success: false,
            message: "Issue not found",
            data: {}
        })
        }

        const row = result.rows[0]
        const issueResponse: IIssueResponse = {
            id: row.id,
            title: row.title,
            description: row.description,
            type: row.type,
            status: row.status,
            reporter: {
                id: row.reporter_id,
                name: row.reporter_name,
                role: row.reporter_role,
            },
            created_at: row.created_at,
            updated_at: row.updated_at,
        }

        res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
            data: issueResponse
        })
    } catch (error : any) {
       res.status(500).json({
        success: false,
        message: error.message,
        error: error
       }) 
    }
}

const updateIssue = async(req:Request, res: Response)=>{
    const {id} = req.params
    try {
        const result = await issueService.updateIssueIntoDB(id as string)

        if(result.rows.length === 0){
            res.status(404).json({
                success: false,
                massage: "Issue Not Found"
            })
        }

        res.send(201).json({
            success: true,
            massage: "Issue Updated Successfully",
            data: result.rows[0]
        })

    } catch (error : any) {
        res.status(500).json({
            success: false,
            massage: error.massage,
            data: error
        })
    }
}

const deleteIssue = async(req: Request, res: Response)=>{
    const {id}  =req.params
    try {
        const result = await issueService.deleteIssueIntoDB(id as string)

        if(result.rows.length === 0){
            res.status(404).json({
                success: false,
                massage: "User Not Found",
            })
        }

        res.status(201).json({
            success: true,
            massage: "User Deleted successfully",
            data: {},
        })

    } catch (error: any) {
        res.status(500).json({
        success: true,
        massage: error.massage,
        error: error
        })

    }
}

export const issueController = {
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
}