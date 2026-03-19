import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import pool from "../config/db.js";

export const register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *",
            [email, hashedPassword, name]
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET
        );

        res.json({ user, token });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );

    const user = result.rows[0];

    if (!user) {
        return res.status(400).json("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json("Wrong password");
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET
    );

    res.json({ user, token });
};