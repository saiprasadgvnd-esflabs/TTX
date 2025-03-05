import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// Create a new answer for a user session
router.post("/:session_id", async (req: any, res: any) => {
    try {
        const { session_id } = req.params;
        const { option, is_correct, answered_in, scenario_question_id } = req.body;

        if (!option || is_correct === undefined || !answered_in || !scenario_question_id) {
            return res.status(400).json({ error: "option, is_correct, answered_in, and scenario_question_id are required" });
        }

        // Get user_session_id based on session_id
        const sessionResult = await pool.query(
            "SELECT id FROM public.user_sessions WHERE session_id = $1",
            [session_id]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: `User session with session_id ${session_id} not found` });
        }

        const user_session_id = sessionResult.rows[0].id;

        const result = await pool.query(
            "INSERT INTO public.user_session_answers (user_session_id, option, is_correct, answered_in, scenario_question_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [user_session_id, JSON.stringify(option), is_correct, answered_in, scenario_question_id]
        );

        res.status(201).json({ message: "Answer recorded successfully", answer: result.rows[0] });
    } catch (error) {
        console.error("❌ Error creating user session answer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.put("/:session_id/completed", async (req:any, res:any) => {
    try {
        const {session_id} = req.params;
        await pool.query("update user_sessions set completed_on= now() where session_id = $1", [session_id]);
        res.status(200).json({message:"session Complted"})
    } catch (error) {
        res.status(500).json({error:"Internal Error Occured"})
    }   
})
// Get all answers for a user session
router.get("/:session_id", async (req: any, res: any) => {
    try {
        const { session_id } = req.params;

        // Get user_session_id based on session_id
        const sessionResult = await pool.query(
            "SELECT id FROM public.user_sessions WHERE session_id = $1",
            [session_id]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: `User session with session_id ${session_id} not found` });
        }

        const user_session_id = sessionResult.rows[0].id;

        const result = await pool.query(
            "SELECT * FROM public.user_session_answers WHERE user_session_id = $1 ORDER BY id",
            [user_session_id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching user session answers:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;


import { Server } from "socket.io";

const userSessionAnswersRouter = Router();

export function setupUserSessionAnswersRoutes(io: Server) {
    userSessionAnswersRouter.post("/:session_id", async (req:any, res:any) => {
        const { session_id } = req.params;
        const { option, is_correct, answered_in, scenario_question_id } = req.body;

        try {
            const sessionResult = await pool.query(
                "SELECT id FROM public.user_sessions WHERE session_id = $1",
                [session_id]
            );
    
            if (sessionResult.rows.length === 0) {
                return res.status(404).json({ error: `User session with session_id ${session_id} not found` });
            }
    
            const user_session_id = sessionResult.rows[0].id;
            // Insert new answer into database
            await pool.query(
                `INSERT INTO user_session_answers (user_session_id, option, is_correct, answered_in, scenario_question_id)
                VALUES ($1, $2, $3, $4, $5)`,
                [user_session_id, JSON.stringify(option), is_correct, answered_in, scenario_question_id]
            );

            // Fetch latest dashboard data
            const result = await pool.query(`SELECT get_live_dashboard_data($1) AS dashboard_data`, [session_id]);

            // Emit WebSocket update
            io.emit("live-dashboard-update", result.rows[0].dashboard_data);

            res.status(201).json({ message: "Answer recorded", dashboardData: result.rows[0].dashboard_data });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Error recording answer" });
        }
    });

    return userSessionAnswersRouter;
}
