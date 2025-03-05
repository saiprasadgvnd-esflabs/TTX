import { Router } from "express";
import pool from "../db";
import { Server } from "socket.io";

const liveDashboardRouter = Router();

export function setupLiveDashboardRoutes(io: Server) {
    liveDashboardRouter.get("/:session_id", async (req, res) => {
        const { session_id } = req.params;

        try {
            const result = await pool.query(`SELECT get_live_dashboard_data($1) AS dashboard_data`, [session_id]);
            const dashboardData = result.rows[0].dashboard_data;

            // Emit WebSocket event
            io.emit("live-dashboard-update", dashboardData);

            res.json(dashboardData);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Error fetching dashboard data" });
        }
    });

    return liveDashboardRouter;
}

export default liveDashboardRouter;