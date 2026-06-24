import type { Request, Response } from "express";
import { pool } from "../../DB";
import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from "../../config";

const signupUserFromDB = async (payload: {name: string, email: string, password: string, role: string}) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10)

  const result = await pool.query(`
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING *
        `, [name, email, hashPassword, role])

  console.log(result)

  delete result.rows[0].password

  return result
};

const loginUserFromDb= async (payload: {email: string, password: string})=>{
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

        delete user.password;


            return {
        token: accessToken, refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
        }
    };

}

const generateRefreshToken =async(token: string)=>{
    if(!token){
        throw new Error("unathorized")
    }
    const decoded = jwt.verify(token as string, config.secret as string) as JwtPayload
    console.log(decoded)

    const userData = await pool.query(`
        SELECT * FROM users WHERE EMAIL =$1
        `, [decoded.email])

    const user = userData.rows[0]

    if(userData.rows.length ===0){
        throw new Error ("user not found")
    }

    const jwtPayload= {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email
        }

    const accessToken  = jwt.sign(jwtPayload, config.refresh_secret as string, {expiresIn: "1d"})

    return accessToken

}

export const authService = {
    loginUserFromDb,
    generateRefreshToken,
    signupUserFromDB
}