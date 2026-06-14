import { Pool } from "pg"

const createUser = async(req: Request, res: Response) =>{

  

  res.status(200).json({
    massage : "Post Created Successful",
    data: {name, email, password, role}
  })
}

export default userController = {
    createUser,
}