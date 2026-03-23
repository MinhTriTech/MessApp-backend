import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import pool from "../config/db.js";

const normalizeEnv = (value) => value?.trim().replace(/^['\"]|['\"]$/g, "");

const emailUser = normalizeEnv(process.env.EMAIL_USER);
const emailPass = normalizeEnv(process.env.EMAIL_PASS);

// Config mail
export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

// Auth
export const register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (email, password, name, is_verified) 
            VALUES ($1, $2, NULL, FALSE) 
            RETURNING id, email, name, is_verified`,
            [email, hashedPassword]
        );

        const user = result.rows[0];

        sendVerificationEmail(user).catch(console.error);

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

// Hậu auth
export const getMe = async (req, res) => {
    const userId = req.user.id;

    const result = await pool.query(
    "SELECT id, email, name, is_verified FROM users WHERE id = $1", [userId]);

    res.json(result.rows[0]);
};

export const sendVerifyEmail = async (req, res) => {
    const userId = req.user.id;

    try {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

        await pool.query(`
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)    
        `, [userId, token, expiresAt]);

        const verifyLink = `http://localhost:8000/auth/verifyEmail?token=${token}`;

        await transporter.sendMail({
            from: emailUser,
            to: req.user.email,
            subject: "Verify your email",
            html: `
                <h3>Xác nhận email</h3>
                <p>Click vào link bên dưới:</p>
                <a href="${verifyLink}">${verifyLink}</a>
            `,
        });

        res.json({ message: "Email sent" });
    } catch(error) {
        res.status(500).json(error.message);
    }
};

const sendVerificationEmail = async (user) => {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await pool.query(
        `INSERT INTO email_verification_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt]
    );

    const verifyLink = `http://localhost:8000/auth/verifyEmail?token=${token}`;

    await transporter.sendMail({
        from: emailUser,
        to: user.email,
        subject: "Verify your email",
        html: `
            <h3>Xác nhận email</h3>
            <p>Click vào link bên dưới:</p>
            <a href="${verifyLink}">${verifyLink}</a>
        `,
    });
};

export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const result = await pool.query(`
        SELECT * FROM email_verification_tokens
        WHERE token = $1
        `, [token]);

        if (result.rows.length === 0) {
            return res.status(400).json("Token không hợp lệ");
        }

        const record = result.rows[0];

        if (new Date(record.expires_at) < new Date()) {
            return res.status(400).json("Token đã hết hạn");
        }

        await pool.query("UPDATE users SET is_verified = TRUE WHERE id = $1", [record.user_id]);

        await pool.query("DELETE FROM email_verification_tokens WHERE user_id = $1", [record.user_id]);

        res.redirect("http://localhost:5173/verify-success");
    } catch(error) {
        res.status(500).json(error.message);
    }
};

export const updateName = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;

    try {
        const result = await pool.query(
        `UPDATE users
        SET name = $1
        WHERE id = $2
        RETURNING id, email, name, is_verified`,
        [name, userId]);

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json(error.message);
    } 
};
