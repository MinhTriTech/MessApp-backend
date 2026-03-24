import express from "express";
import { getMessageByConversation, uploadFileByMessage } from "../controllers/messageController.js";
import upload from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:conversationId", authMiddleware, getMessageByConversation);
router.post("/uploads", authMiddleware, upload.single("file"), uploadFileByMessage);

export default router;