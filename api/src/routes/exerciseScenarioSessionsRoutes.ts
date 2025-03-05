import { Router, Request, Response } from "express";
import pool from "../db";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Create a new exercise scenario session
router.post("/", async (req: any, res: any) => {
    try {
        const { exercise_id, scenario_id, scheduled_start_time, scheduled_end_time, created_by } = req.body;

        if (!exercise_id || !scenario_id || !scheduled_start_time || !scheduled_end_time || !created_by) {
            return res.status(400).json({ error: "exercise_id, scenario_id, scheduled_start_time, scheduled_end_time, and created_by are required" });
        }

        // Validate exercise_id
        const exerciseCheck = await pool.query("SELECT * FROM public.execrise WHERE id = $1", [exercise_id]);
        if (exerciseCheck.rows.length === 0) {
            return res.status(404).json({ error: `Exercise ID ${exercise_id} does not exist` });
        }

        // Validate scenario_id
        const scenarioCheck = await pool.query("SELECT * FROM public.scenarios WHERE id = $1", [scenario_id]);
        if (scenarioCheck.rows.length === 0) {
            return res.status(404).json({ error: `Scenario ID ${scenario_id} does not exist` });
        }

        // Generate session_id and link
        const sessionId = uuidv4();
        const hostname = process.env.HOSTNAME || "http://localhost:3000";
        const sessionLink = `${hostname}/session/${sessionId}`;

        // Insert session into the database
        const result = await pool.query(
            `INSERT INTO public.exercise_scenario_sessions 
            (session_id, exercise_id, scenario_id, link, scheduled_start_time, scheduled_end_time, created_by, created_on, is_active) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), TRUE) RETURNING *`,
            [sessionId, exercise_id, scenario_id, sessionLink, scheduled_start_time, scheduled_end_time, created_by]
        );

        res.status(201).json({ message: "Session created successfully", session: result.rows[0] });
    } catch (error) {
        console.error("❌ Error creating session:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/session/:session_id", async (req:any, res:any) =>{
    try {
        var {session_id} = req.params
        const result = await pool.query("select a.exercise_id, a.scenario_id, b.client_id as client_id from exercise_scenario_sessions a, execrise b where a.session_id=$1 and b.id = a.exercise_id;", [session_id])
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error getting session", error);
        res.status(500).json({error:"Internal Server Error"});
    }
})

// Get all sessions
router.get("/", async (req: any, res: any) => {
    try {
        const result = await pool.query("SELECT * FROM public.exercise_scenario_sessions ORDER BY created_on DESC");

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching sessions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
