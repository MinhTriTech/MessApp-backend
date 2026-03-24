import express from "express";
import { getMe, login, register, sendVerifyEmail, updateMe, updateName, verifyEmail } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.get("/getMe", authMiddleware, getMe);
router.patch("/updateName", authMiddleware, updateName);

router.post("/send-verify-email", authMiddleware, sendVerifyEmail);
router.get("/verifyEmail", verifyEmail);

router.patch("/update", authMiddleware, updateMe);

export default router;