import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { initSocket } from "./sockets/socket.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/messages", messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*"},
});

initSocket(io);

server.listen(process.env.PORT, () => {
    console.log("Server running on port", process.env.PORT);
});

