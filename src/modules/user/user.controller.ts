import type { Request, Response } from "express"
import { userService } from "./user.service"

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserIntoDb(req.body)

    res.status(201).json({
      success: true,
      massage: "User created Successfully",
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

const getAllUsers = async (req: Request, res: Response) => {
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

const getSingleUser = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const result = await userService.getSingleUserDb(id as string)

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User Not found!",
          data: {},
        })
      }

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
}

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const result = await userService.updateUserFromDb(req.body, id as string)

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully!",
      data: result.rows[0],
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
}

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const result = await userService.deleteUserFromDb(id as string)

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
      data: {},
    });

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
  getSingleUser,
  updateUser,
  deleteUser
}