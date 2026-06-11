import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connect_string
})

export const initDB = async()=>{
    try {
        pool.query(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30),
    email VARCHAR(30),
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
            `)
    } catch (error) {
        console.log(error)
    }
}