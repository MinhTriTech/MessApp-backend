import pool from "../config/db.js";

export const getMessageByConversation = async (req, res) => {
    const { conversationId } = req.params;

    try {
        const result = await pool.query(
        `
        SELECT * FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        `, [conversationId]);

        res.json(result.rows)
    } catch (error) {
        console.error("Error fetching messages: ", error);
        res.status(500).json({ error: "Internal server error"});
    }
};