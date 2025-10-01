import { type Request, type Response, type NextFunction, Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { type CustomRequest, type UserPayload } from "../libs/types.js";
import { users } from "../db/db.js";

//interface CustomRequest extends Request {
//    user?: any; // Define the user property
//    token?: string; // Define the token property
// }
const router = Router();

export const authenticateToken = (
  req: CustomRequest, // using a custom request
  res: Response,
  next: NextFunction
) => {
  // 1. check Request if "authorization" header exists
  //    and container "Bearer ...JWT-Token..."
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header is required",
    });
  }

  // 2. extract the "...JWT-Token..." if available
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.status(401).json({
      success: false,
      message: "Token is required",
    });

  try {
    // 3. verify token using JWT_SECRET_KEY and
    //    get payload "user" = { username, studentId, role }
    const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret";
    jwt.verify(token, jwt_secret, (err, user) => {
      if (err)
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token",
        });

      // 4. Attach "user" payload and "other stuffs" to the custom request
      req.user = user as UserPayload;
      req.token = token;

      // 5. Proceed to next middleware or route handler
      next();
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong with authentication process",
      error: err,
    });
  }
};

router.get("/", authenticateToken, (req: Request, res: Response) => {
  try {
    // After the Request has been processed by 'authenticateToken' middleware
    // 1. Get "user payload" and "token" from (custom) request
    const payload = (req as CustomRequest).user;
    const token = (req as CustomRequest).token;

    // 2. check if user exists (search with username) and role is ADMIN

    // return all users
    return res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});