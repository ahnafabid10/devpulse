import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const signUpUser = async(req: Request, res: Response)=>{
    try {
        const result = await authService.signupUserFromDB(req.body)
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

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserFromDb(req.body)
        const { refreshToken } = result

        res.cookie("refreshToken", refreshToken, {
            secure: false,
            httpOnly: true,
            sameSite: "lax"
        })
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Profile created successfully!",
            data: result, 
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        })
    }
}

const refreshToken = async (req: Request, res: Response) => {
    try {

        const result = await authService.generateRefreshToken(req.cookies.refreshToken)

        // const {refreshToken} = result

        res.cookie("refreshToken", refreshToken, {
            secure: false, // in prod true
            httpOnly: true,
            sameSite: "lax"
        })

        res.status(201).json({
            success: true,
            message: "Profile created successfully!",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
}

export const authController = {
    loginUser,
    refreshToken,
    signUpUser
}