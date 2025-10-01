// src/middlewares/checkRoleAdminMiddleware.ts
import { type Request, type Response, type NextFunction } from "express";
import { type CustomRequest, type User } from "../libs/types.js";
import { users } from "../db/db.js";

// interface CustomRequest extends Request {
//   user?: any; // Define the user property
//   token?: string; // Define the token property
// }

export const checkRole = (roles: string[] | string) =>
  (req: CustomRequest, res: Response, next: NextFunction) => {
    const payload = req.user;
    const token = req.token;

    // Normalize roles into array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Find user by username
    const user = users.find((u: User) => u.username === payload?.username);

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // (optional) validate token with user data

    next();
  };