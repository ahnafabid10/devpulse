import { Router } from "express"
import { userController } from "./user.controller"

const router = Router()

router.post('/api/auth/signup', userController.createUser)

router.get('/', userController.getAllUsers)

router.get("/:id", userController.getSingleUser)

router.put("/:id", userController.updateUser)

router.delete("/:id", userController.deleteUser)

export const userRouter = router