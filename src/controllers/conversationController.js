import pool from "../config/db.js";

export const getConversations = async (req, res) => {
    const userId = req.user.id;

    const result = await pool.query(`
        SELECT 
            c.id AS conversation_id,
            u.id AS target_id,
            u.name AS target_name,
            m.content AS last_message,
            m.created_at AS last_time
        FROM conversations c

        JOIN conversation_participants cp1
            ON cp1.conversation_id = c.id

        JOIN conversation_participants cp2
            ON cp2.conversation_id = c.id
            AND cp2.user_id != cp1.user_id

        JOIN users u
            ON u.id = cp2.user_id

        LEFT JOIN LATERAL (
            SELECT content, created_at
            FROM messages 
            WHERE conversation_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON true

        WHERE cp1.user_id = $1
        ORDER BY m.created_at DESC;
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

export const getParticipantByConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        const query = `
            SELECT u.id, u.name
            FROM conversation_participants cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.conversation_id = $1
        `;

        const { rows } = await pool.query(query, [conversationId]);

        return res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: "Internal server error"});
    }
};