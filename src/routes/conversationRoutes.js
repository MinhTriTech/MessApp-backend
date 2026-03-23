import express from "express";
import { createConversation, getConversations, getParticipantByConversation } from "../controllers/conversationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getConversations);
router.post("/", authMiddleware, createConversation);
router.get("/:conversationId/participants", authMiddleware, getParticipantByConversation);

export default router;