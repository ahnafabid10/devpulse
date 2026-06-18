import { pool } from "../../DB"
import type { IUser } from "./user.interface"
import bcrypt from "bcryptjs";


const createUserIntoDb = async (payload: IUser) => {
  const { name, email, password, role } = payload

  const hashPassword = await bcrypt.hash(password, 10)

  const result = await pool.query(`
        INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING *
        `, [name, email, hashPassword, role])

  console.log(result)

  delete result.rows[0].password

  return result

}

const getAllUsersFromDb = async (id: string) => {
  const result = await pool.query(`
    SELECT * FROM users
    `, [id])

  return result
}

const getSingleUserDb = async (id: string) => {
  const result = await pool.query(`
    SELECT * FROM users WHERE id =$1
    `, [id]
  )

  return result
}

const updateUserFromDb = async (payload : IUser ,id: string) => {

  const {name,password, is_active, role} = payload

  const result = await pool.query(`
    UPDATE users
    SET name = COALESCE($1, name),
    password = COALESCE($2, password),
    role= COALESCE($3, role),
    is_active=COALESCE($4, is_active)
        WHERE id = $5 

        RETURNING *
    `, [name, password, role, is_active, id])

    return result
}


const deleteUserFromDb = async(id: string)=>{
  const result = await pool.query(`
    DELETE FROM users WHERE id = $1
    RETURNING *
    `, [id])

    return result
}

export const userService = {
  createUserIntoDb,
  getAllUsersFromDb,
  getSingleUserDb,
  updateUserFromDb,
  deleteUserFromDb

}