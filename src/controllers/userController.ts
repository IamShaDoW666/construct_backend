import db from "../utils/db";
import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import { sendError, sendSuccess } from "../utils/network";

const getAllUsers = async (req: Request, res: Response) => {
  const users = await db.user.findMany({
    omit: {
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  sendSuccess(res, users);
};

const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await db.user.findUnique({
    where: {
      id: id,
    },
    omit: {
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    sendError(res, "User not found", 404);
    return;
  }
  sendSuccess(res, user);
};

const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    sendError(res, "Please provide all required fields", 400);
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    sendError(res, "Please provide a valid email", 400);
    return;
  }
  const hashedPassword = await bcrypt.hash(password!, 10);
  const existingUser = await db.user.findUnique({
    where: {
      email: email,
    },
  });
  if (existingUser) {
    sendError(res, "User already exists", 409);
    return;
  }
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  sendSuccess(res, user, "User created successfully", 201);
};

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.user.update({
    where: {
      id: id,
    },
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  sendSuccess(res, user, "User updated successfully");
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const response = await db.user.delete({
    where: {
      id: id,
    },
  });
  sendSuccess(res, response, "User deleted successfully", 204);
};

const userController = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default userController;
