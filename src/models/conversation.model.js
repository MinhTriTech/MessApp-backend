import pool from "../config/db.js";

export const getParticipants = async (conversation_id) => {
    const result = await pool.query(
        `SELECT user_id 
        FROM conversation_participants
        WHERE conversation_id = $1`,
        [conversation_id]
    );

    return result.rows;
}