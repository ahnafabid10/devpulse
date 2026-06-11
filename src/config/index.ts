import dotenv from "dotenv"
import path from "path"

dotenv.config({
    path: path.join(process.cwd(), ".env")
})

const config = {
    connect_string : process.env.CONNECTIONSTRING,
    port: process.env.PORT,
    secret: process.env.JWT_SECRET,
}

export default config