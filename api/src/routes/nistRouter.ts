import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// Create a new NIST framework entry
router.post("/", async (req: any, res: any) => {
    try {
        const { name, seq_no } = req.body;

        if (!name || !seq_no) {
            return res.status(400).json({ error: "Name and seq_no are required" });
        }

        const result = await pool.query(
            "INSERT INTO public.nist_frameworks (name, seq_no) VALUES ($1, $2) RETURNING *",
            [name, seq_no]
        );

        res.status(201).json({ message: "NIST Framework entry created successfully", nistFramework: result.rows[0] });
    } catch (error) {
        console.error("❌ Error creating NIST framework entry:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all NIST framework entries
router.get("/", async (req: any, res: any) => {
    try {
        const result = await pool.query("SELECT * FROM public.nist_frameworks ORDER BY seq_no ASC");

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching NIST frameworks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
