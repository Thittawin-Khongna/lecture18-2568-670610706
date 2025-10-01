import e, { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import type { User, CustomRequest, UserPayload } from "../libs/types.js";
import { checkRole } from "../middlewares/checkRoleAdminMiddleware.js";
import { authenticateToken } from "../middlewares/authenMiddleware.js";

// import database
import { users, reset_users, students, courses, enrollments } from "../db/db.js";
import { string, success } from "zod";
import { error } from "console";
import { userInfo } from "os";
import { zStudentId,zCourseId ,zCoursePostBody} from "../libs/zodValidators.js";
import { type Student, type Course } from "../libs/types.js";

const router = Router();



// GET /api/v2/users
router.get("/",authenticateToken,checkRole("ADMIN"), (req: Request, res: Response) => {
    // return all users
  try{
       return res.json({
      success: true,
      data: users,
    });


}catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  };
})

router.get("/:studentId",checkRole("ADMIN"), (req: Request, res: Response) => {
    // return all users
  try{

    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);

    const student = students.find((s: Student) => s.studentId === studentId);
    if (!student) {
    return res.status(403).json({
      success: false,
      message: "Forbidden access",
    });
    }

    res.status(200).json({
      success: true,
      message: "Student Information",
      data: student
    });
  
}catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  };
})

router.get("/:studentId",checkRole("STUDENT"), (req: Request, res: Response) => {
    // return all users
  try{

    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);

    const student = students.find((s: Student) => s.studentId === studentId);

    if (!student) {
    return res.status(403).json({
      success: false,
      message: "Forbidden access",
    });
    }
    
      res.status(200).json({
      success: true,
      message: "Student Information",
      data: student
    });
  
}catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  };
})

router.post("/:studentId",checkRole("STUDENT"), (req: Request, res: Response) => {
    // return all users
  try{

    const studentid = req.params.studentId;

    const {studentId,courseId} = req.body;

    const foundIndexc = enrollments.find((a) => {
      a.courseId === courseId
      a.studentId === studentId
    })
        if (foundIndexc) {
            return res.status(409).json({
                success: false,
                massage: "studentId && courseId is already exists"
            })
        }
    
    if (studentid != studentId) {
    return res.status(403).json({
      success: false,
      message: "Forbidden access",
    });
    }
    enrollments.push({
      studentId,
      courseId
    });

      res.status(200).json({
      success: true,
      message: `Student ${studentId} && Course ${courseId} has been added successfully`,
      data: {
        studentId: studentId,
        courseId: courseId
      }
    });
  
}catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  };
})

router.delete("/:studentId",checkRole("STUDENT"), (req: Request, res: Response) => {
    // return all users
  try{

    const studentid = req.params.studentId;

    const {studentId,courseId} = req.body;

    const foundIndex = enrollments.findIndex(
      (e) => e.studentId === studentId && e.courseId === courseId
    );
    const foundcourses = enrollments.findIndex(
      (e) => e.courseId === courseId
    );
    if (!foundcourses) {
      return res.status(404).json({
      success: false,
      message: "Enrollment does not exists",
    });
    }
    
    if (studentid != studentId) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to modify another student's data",
    });
    }

    enrollments.splice(foundIndex, 1);
    
      res.set("Link", `/${studentId}`);
      res.status(200).json({
      success: true,
      message: `Student ${studentId} && Course ${courseId} has been deleted successfully`,
      data: {
        studentId: studentId,
        courseId: courseId
      }
    });
  
}catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  };
})


// POST /api/v2/users/login
router.post("/login", (req: Request, res: Response) => {
    try{
        // 1. get username and password from body
        const {username,password} = req.body;
        res.set("Link", `/login`);
        const user = users.find(
            (u:User) => u.username === username && u.password === password
        );
      // 2. check if user exists (search with username & password in DB)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password!",
            });
        }
     // 3. create JWT token (with user info object as payload) using JWT_SECRET_KEY
      //    (optional: save the token as part of User data)
        const jwt_secret = process.env.JWT_SECRET || "forgot_secret";

        const token = jwt.sign({
            username: user.username,
            studensId: user.studentId,
            role: user.role,

        },jwt_secret,{expiresIn: "5m"});
      // 4. send HTTP response with JWT token

        res.status(200).json({
            success: true,
            message: "Login successful",
            token
        })

    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: err
        })
    }
  // 1. get username and password from body

  // 2. check if user exists (search with username & password in DB)

  // 3. create JWT token (with user info object as payload) using JWT_SECRET_KEY
  //    (optional: save the token as part of User data)

  // 4. send HTTP response with JWT token

  return res.status(500).json({
    success: false,
    message: "POST /api/v2/users/login has not been implemented yet",
  });
});

// POST /api/v2/users/logout
router.post("/logout", (req: Request, res: Response) => {
  // 1. check Request if "authorization" header exists
  //    and container "Bearer ...JWT-Token..."

  // 2. extract the "...JWT-Token..." if available

  // 3. verify token using JWT_SECRET_KEY and get payload (username, studentId and role)

  // 4. check if user exists (search with username)

  // 5. proceed with logout process and return HTTP response
  //    (optional: remove the token from User data)

  return res.status(500).json({
    success: false,
    message: "POST /api/v2/users/logout has not been implemented yet",
  });
});

// POST /api/v2/users/reset
router.post("/reset",authenticateToken,checkRole("ADMIN"), (req: Request, res: Response) => {
  try {
    reset_users();
    return res.status(200).json({
      success: true,
      message: "User database has been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unauthorized user",
      error: err,
    });
  }
});

export default router;