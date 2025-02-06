import express from "express";
import dotenv from "dotenv";
import pool from "./db";
import clientRoutes from "./routes/clientController";
import roleRoutes from './routes/roleRouter';
import teamRoutes from './routes/teamRoutes'
import exericiseRouter from "./routes/exericiseRouter";
import scenarioRoutes from "./routes/scenarioRoutes";
import scenarioInjectRoutes from "./routes/scenarioInjectRoutes";
import scenarioQuestionRoutes from "./routes/scenarioQuestionRoutes";
import cors from 'cors';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());
app.use("/clients", clientRoutes);
app.use('/roles', roleRoutes)
app.use('/teams', teamRoutes)
app.use('/exercises',exericiseRouter)
app.use('/scenarios', scenarioRoutes)
app.use("/scenario-injects", scenarioInjectRoutes);
app.use("/scenario-questions", scenarioQuestionRoutes);

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
