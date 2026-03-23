import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { initSocket } from "./sockets/socket.js";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import userRoutes from "./routes/userRoutes.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/conversations", conversationRoutes);
app.use("/users", userRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*"},
});

initSocket(io);

server.listen(process.env.PORT, () => {
    console.log("Server running on port", process.env.PORT);
});

