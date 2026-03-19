import express from "express";
import { getMessageByConversation } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:conversationId", getMessageByConversation);

export default router;