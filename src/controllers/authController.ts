import { Response, Request } from "express";
import db from "../utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendError, sendSuccess } from "../utils/network";

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    sendError(res, "Please provide email and password", 400);
    return;
  }
  const user = await db.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    sendError(res, "Invalid credentials", 401);
    return;
  }
  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) {
    sendError(res, "Invalid credentials", 401);
    return;
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, time: new Date().toLocaleString() },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    }
  );
  sendSuccess(res, { token, user }, "Login successful", 200);
};

const auth = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    sendError(res, "No token provided", 401);
    return;
  }
  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      sendError(res, "Invalid token", 401);
      return;
    }
    sendSuccess(res, decoded, "Token is valid", 200);
  });
};
const authController = {
  login,
  auth,
};
export default authController;
