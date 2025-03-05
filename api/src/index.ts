import express from "express";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import pool from "./db";

import clientRoutes from "./routes/clientController";
import roleRoutes from './routes/roleRouter';
import teamRoutes from './routes/teamRoutes';
import exericiseRouter from "./routes/exericiseRouter";
import scenarioRoutes from "./routes/scenarioRoutes";
import scenarioInjectRoutes from "./routes/scenarioInjectRoutes";
import scenarioQuestionRoutes from "./routes/scenarioQuestionRoutes";
import nistRouter from './routes/nistRouter';
import exerciseSessionRouter from './routes/exerciseScenarioSessionsRoutes';
import userSessionRouter from './routes/userSessionsRoutes';
import userSessionAnswersRoutes from "./routes/userSessionAnswersRoutes";
import liveDashboardRouter from "./routes/liveDashboardRouter";
import swotRoutes from './routes/swotRoutes';
import reportsRouter from './routes/exerciseReportsRouter';
import cors from "cors";
import questionCategoryRoutes from "./routes/questionCategoriesRouter"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const eventEmitter = new EventEmitter(); // ✅ Creating EventEmitter instance

app.use(cors());
app.use(express.json());

app.use("/clients", clientRoutes);
app.use("/roles", roleRoutes);
app.use("/teams", teamRoutes);
app.use("/exercises", exericiseRouter);
app.use("/scenarios", scenarioRoutes);
app.use("/scenario-injects", scenarioInjectRoutes);
app.use("/scenario-questions", scenarioQuestionRoutes);
app.use("/nist", nistRouter);
app.use("/user-session", userSessionRouter);
app.use("/exercise-session", exerciseSessionRouter);
app.use("/user-session-answers", userSessionAnswersRoutes);
app.use("/live-dashboard", liveDashboardRouter);
app.use("/swot", swotRoutes)
app.use("/question-categories", questionCategoryRoutes)
app.use("/reports", reportsRouter)
// ✅ Listen for PostgreSQL NOTIFY events
pool.connect().then(client => {
    client.query("LISTEN dashboard_update");

    client.on("notification", async (msg) => {
        const session_id = msg.payload;
        console.log("session_id", session_id);
        
        // Fetch updated dashboard data
        const result = await pool.query(`SELECT get_live_dashboard_data($1) AS dashboard_data`, [session_id]);

        console.log("New Dashboard Data: ", result.rows[0].dashboard_data);

        // ✅ Emit event instead of WebSocket
        eventEmitter.emit("live-dashboard-update", result.rows[0].dashboard_data);
    });

    console.log("Listening for database changes...");
});

// ✅ Create an endpoint to fetch live updates (Polling)
app.get("/live-dashboard-updates", (req, res) => {
    eventEmitter.once("live-dashboard-update", (data) => {
        res.json({ success: true, data });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
