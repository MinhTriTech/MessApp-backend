import express from "express";
import { createConversation, getConversations } from "../controllers/conversationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getConversations);
router.post("/", authMiddleware, createConversation);

export default router;