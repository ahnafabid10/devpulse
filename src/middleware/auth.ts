import type { NextFunction, Request, Response } from "express";
import type { ROLES } from "../types";
import { pool } from "../DB";
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
     const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: "No token provided!",
          data: {},
        });
      }

      const token = authHeader.split(' ')[1];

      const decoded = jwt.verify(
        token as string,
        config.secret as string
      ) as JwtPayload;

      const userData = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [decoded.email]
      );

      const user = userData.rows[0];

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found!",
          data: {},
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized!",
          data: {},
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth