import express from "express";
import { getMessageByConversation, uploadFileByConversation } from "../controllers/messageController.js";
import { uploadMessageFile } from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:conversationId", authMiddleware, getMessageByConversation);
router.post("/uploads", authMiddleware, uploadMessageFile.single("file"), uploadFileByConversation);

export default router;