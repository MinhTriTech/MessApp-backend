import pool from "../config/db.js";

export const getMessageByConversation = async (req, res) => {
    const { conversationId } = req.params;
    const { before, limit = 20 } = req.query;

    try {
        let query = `
            SELECT *
            FROM messages
            WHERE conversation_id = $1
        `;

        const values = [conversationId];

        if (before) {
            query += ` AND created_at < $2`;
            values.push(before); 
        }

        query += `
            ORDER BY created_at DESC
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

export const uploadFileByMessage = async (req, res) => {
    try {
        const file = req.file;
        const { messageId } = req.body;

        if (!file) {
            return res.status(400).json({ message: "File is required"});
        }

        if (!messageId) {
            return res.status(400).json({ message: "messageId is required" });
        }

        const fileUrl = `http://localhost:8000/uploads/${file.filename}`;

        await pool.query(`
        INSERT INTO message_files (message_id, file_name, file_type, file_url)
        VALUES ($1, $2, $3, $4)
        `, [messageId, file.originalname, file.mimetype, fileUrl]);

        res.json({ fileUrl, fileType: file.mimetype });
    } catch (error) {
        console.error(error);
        res.status(500).send("Upload error");
    }
};