import pool from "../config/db.js";
import { getParticipants } from "../models/conversation.model.js";

export const getMessageByConversation = async (req, res) => {
    const { conversationId } = req.params;
    const { before, limit = 20 } = req.query;

    try {
        let query = `
            SELECT
                m.*,
                mf.file_name,
                mf.file_type,
                mf.file_url
            FROM messages m
            LEFT JOIN message_files mf ON mf.message_id = m.id
            WHERE m.conversation_id = $1
        `;

        const values = [conversationId];

        if (before) {
            query += ` AND m.created_at < $2`;
            values.push(before); 
        }

        query += `
            ORDER BY m.created_at DESC
            LIMIT $${values.length + 1}
        `;

        values.push(limit);

        const result = await pool.query(query, values);

        const messages = result.rows;

        res.json({
            messages,
            hasMore: messages.length === Number(limit),
            nextCursor: messages.length > 0 ? messages[messages.length - 1].created_at : null
        });
    } catch (error) {
        console.error("Error fetching messages: ", error);
        res.status(500).json({ error: "Internal server error"});
    }
};

export const uploadFileByConversation = async (req, res) => {
    try {
        const file = req.file;
        const { conversationId } = req.body;
        const clientTempId = req.body.clientTempId || null;
        const userId = req.user.id;

        if (!file) {
            return res.status(400).json({ message: "File is required"});
        }

        if (!conversationId) {
            return res.status(400).json({ message: "conversationId is required" });
        }

        const messageResult = await pool.query(`
           INSERT INTO messages (conversation_id, sender_id, content, type)
           VALUES ($1, $2, $3, $4)
           RETURNING * 
        `, [conversationId, userId, "", "file"]);

        const message = messageResult.rows[0];

        const fileUrl = `http://localhost:8000/uploads/${file.filename}`;

        await pool.query(`
        INSERT INTO message_files (message_id, file_name, file_type, file_url)
        VALUES ($1, $2, $3, $4)
        `, [message.id, file.originalname, file.mimetype, fileUrl]);

        const uploadedMessage = {
            ...message,
            file_name: file.originalname,
            file_type: file.mimetype,
            file_url: fileUrl,
            client_temp_id: clientTempId,
        };

        const io = req.app.get("io");

        if (io) {
            const participants = await getParticipants(conversationId);

            participants.forEach((participant) => {
                if (participant.user_id !== userId) {
                    io.to(`user_${participant.user_id}`).emit("new_message", uploadedMessage);
                }
            });

            io.to(`room_${conversationId}`).emit("receive_message", uploadedMessage);
        }

        res.json({ 
            message: uploadedMessage,
            file: {
                file_name: file.originalname,
                file_type: file.mimetype,
                file_url: fileUrl
            }
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload error" });
    }
};