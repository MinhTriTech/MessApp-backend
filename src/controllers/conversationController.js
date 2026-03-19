import pool from "../config/db.js";

export const getConversations = async (req, res) => {
    const userId = req.user.id;

    const result = await pool.query(`
        SELECT c.id, c.created_at
        FROM conversations c
        JOIN conversation_participants cp
            ON cp.conversation_id = c.id
        WHERE cp.user_id = $1
        ORDER BY c.created_at DESC
    `, [userId]);

    res.json(result.rows);
};

export const createConversation = async (req, res) => {
    const senderId = req.user.id;
    const { receiveId } = req.body;

    const existing = await pool.query(`
        SELECT c.id
        FROM conversations c
        JOIN conversation_participants cp1
            ON cp1.conversation_id = c.id
        JOIN conversation_participants cp2
            ON cp2.conversation_id = c.id
        WHERE cp1.user_id = $1 AND cp2.user_id = $2    
    `, [senderId, receiveId]);

    if (existing.rows.length > 0) {
        return res.json(existing.rows[0]);
    }

    const convo = await pool.query(`
        INSERT INTO conversations DEFAULT VALUES RETURNING *
    `);

    const conversationId = convo.rows[0].id;

    await pool.query(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2), ($1, $3)    
    `, [conversationId, senderId, receiveId]);

    res.json({ id: conversationId});
};