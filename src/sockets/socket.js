import pool from "../config/db.js";
import { getParticipants } from "../models/conversation.model.js";
import { createMessage } from "../models/message.model.js";
import { createUser, findUserById } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const initSocket = (io) => {
    io.on("connection", (socket) => {
        const userRoom = `user_${socket.user.id}`;
        socket.join(userRoom);

        // Join user room
        socket.on("join_user_room", () => {
            socket.join(userRoom);
        });

        socket.on("start_conversation", async ({  targetId }) => {
            const userId = socket.user.id;

            let result = await pool.query(
                `
                SELECT c.id
                FROM conversations c
                JOIN conversation_participants cp1 ON cp1.conversation_id = c.id
                JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
                WHERE cp1.user_id = $1 AND cp2.user_id = $2
                LIMIT 1
                `,
                [userId, targetId]
            );

            let conversationId;

            if (result.rows.length === 0) {
                const newConv = await pool.query(
                    `INSERT INTO conversations DEFAULT VALUES RETURNING id`
                );

                conversationId = newConv.rows[0].id;

                await pool.query(
                    `
                    INSERT INTO conversation_participants (conversation_id, user_id)
                    VALUES ($1, $2), ($1, $3)
                    ` , [conversationId, userId, targetId]
                );
            } else {
                conversationId = result.rows[0].id;
            }

            const room = `room_${conversationId}`;

            socket.join(room);

            socket.emit("conversation_ready", { conversationId });
        });

        socket.on("join_conversation", async (conversationId) => {
            try {
                let existingUser = await findUserById(socket.user.id);
                
                if (!existingUser) {
                    await createUser({id: socket.user.id, name: socket.user.name});
                }

                const room = `room_${conversationId}`;

                socket.join(room);
            } catch (error) {
                console.error("User error:", error);
            }
        });

        socket.on("leave_conversation", (conversationId) => {
            const roomName = `room_${conversationId}`;
            socket.leave(roomName);
        });

        socket.on("send_message", async (data) => {
            try {
                const { conversation_id, content} = data;

                const saveMessage = await createMessage({
                    conversation_id,
                    sender_id: socket.user.id,
                    content,
                });

                const participants = await getParticipants(conversation_id);

                participants.forEach((participant) => {
                    if (participant.user_id !== socket.user.id) {
                        io.to(`user_${participant.user_id}`).emit("new_message", saveMessage);
                    }
                });

                const room = `room_${conversation_id}`;
                io.to(room).emit("receive_message", saveMessage);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on("typing", ({ conversationId }) => {
            const userId = socket.user.id;
            const room = `room_${conversationId}`;
            socket.to(room).emit("typing", { userId });
        });

        socket.on("stop_typing", ({ conversationId }) => {
            const userId = socket.user.id;
            const room = `room_${conversationId}`;
            socket.to(room).emit("stop_typing", { userId });
        });

        socket.on("mark_seen", async ({ messageId }) => {
            const userId = socket.user.id;

            try {
                await pool.query(`
                    INSERT INTO message_reads (message_id, user_id)
                    VALUES ($1, $2)
                    ON CONFLICT (message_id, user_id) DO NOTHING 
                `, [messageId, userId]);

                const result = await pool.query(`
                   SELECT conversation_id
                   FROM messages
                   WHERE id = $1 
                `, [messageId]);

                const conversationId = result.rows[0].conversation_id;
                const room = `room_${conversationId}`;

                socket.to(room).emit("message_seen", {
                    messageId,
                    userId
                });
            } catch (error) {
                console.error(error);
            }
        });        

        socket.on("disconnect", () => {
            console.log("User disconnect");
        });
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error("Unauthorized"));
        }
    });
};