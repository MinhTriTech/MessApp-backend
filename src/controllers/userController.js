import pool from "../config/db.js";

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const myId = req.user.id;

        if (!q || q.trim() === "") {
            return res.status(400).json({ message: "Missing query" });
        }

        const keyword = q.trim();
        const isEmail = keyword.includes("@");

        let result;

        if (isEmail) {
            result = await pool.query(`
            SELECT id, name, email
            FROM users
            WHERE email = $1
            LIMIT 1    
            `, [keyword]);
        } else {
            result = await pool.query(`
            SELECT id, name
            FROM users
            WHERE name ILIKE $1 AND id != $2
            LIMIT 10
            `, [`%${keyword}%`, myId]);
        }

        return res.json(result.rows);
    } catch (error) {
        console.error("Search users error:", error);
        return res.status(500).json({ message: "Server error"});
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
        SELECT id, name, avatar
        FROM users
        WHERE id = $1    
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};