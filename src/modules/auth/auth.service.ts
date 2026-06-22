import type { Request, Response } from "express";
import { pool } from "../../DB";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import config from "../../config";

const loginUser= async (payload: {email: string, password: string})=>{
    const {email, password} = payload
    const userData = await pool.query(`
        SELECT * FROM users WHERE EMAIL =$1
        `, [email])

        if(userData.rows.length===0){
            throw new Error("Error credentials")
        }

        const user = userData.rows[0]

        const matchPassword = await bcrypt.compare(password, user.password)

        if(!matchPassword){
            throw new Error("Invalid Credentials")
        }

        const jwtPayload= {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email
        }

        const accessToken = jwt.sign(jwtPayload, config.secret as string, {expiresIn: "1d"})
        const refreshToken = jwt.sign(jwtPayload, config.refresh_secret as string, {expiresIn: "7d"})

        return {accessToken, refreshToken}

}