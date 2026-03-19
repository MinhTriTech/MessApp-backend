import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const { email, password, name } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
        "INSERT INTO users(email, password, name) VALUES($1, $2, $3) RETURNING *",
        [email, hashed, name]
    );

    res.json(result.rows[0]);
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );

    if (user.rows.length) return res.status(400).json("User not found");

    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) return res.status(400).json("Wrong password");
    
    const token = jwt.sign(
        { id: user.rows[0].id },
        process.env.JWT_SECRET
    );

    res.json({ token, user: user.rows[0]});
};