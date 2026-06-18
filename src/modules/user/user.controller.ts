import type { Request, Response } from "express"
import { pool } from "../../DB"
import { userService } from "./user.service"

const createUser = async(req: Request, res: Response)=>{
     try {
        const result = await userService.createUserIntoDb(req.body)

        res.status(201).json({
            success: true,
            massage: "user created Successfully",
            data: result.rows[0]
        })

     } catch (error) {
    res.status(500).json({
      success: false,
    //   message: error.message,
      error: error,
    });
     }
}

const getAllUsers = async (req: Request, res: Response) =>{
  try {
    const result = await userService.getAllUsersFromDb()
    res.status(200).json({
      success: true,
      massage: "users retrived Successfully",
      data: result.rows,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
}

export const userController = {
    createUser,
    getAllUsers,
}