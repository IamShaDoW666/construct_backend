import express from "express";
import userRoutes from "../routes/userRoutes";
import authRoutes from "../routes/authRoutes";
import authenticated from "../middlewares/authenticated";

const router = express.Router();

router.use("/users", authenticated, userRoutes);
router.use("/auth", authRoutes);
export default router;
