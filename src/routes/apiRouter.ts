import express from "express";
import userRoutes from "../routes/userRoutes";
import authRoutes from "../routes/authRoutes";
import mediaRoutes from "../routes/mediaRouter";
import batchRoutes from "../routes/batchRoutes";
import authenticated from "../middlewares/authenticated";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/media", authenticated, mediaRoutes);
router.use("/batch", authenticated, batchRoutes);
export default router;
